"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const http = require("node:http");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const puppeteer = require(path.join(process.env.BROWSER_TEST_TOOLS, "node_modules/puppeteer-core"));

const candidateRoot = path.resolve(__dirname, "..");
const baselineSha = "7a5131ffdd8035dc18279454e4bc3baad2302aa9";
const mime = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".svg", "image/svg+xml"],
  [".webp", "image/webp"], [".png", "image/png"], [".jpg", "image/jpeg"],
  [".woff", "font/woff"], [".woff2", "font/woff2"], [".mp4", "video/mp4"],
]);
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

async function serveDir(root) {
  const server = http.createServer((req, res) => {
    let urlPath;
    try { urlPath = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname); }
    catch { res.writeHead(400); res.end(); return; }
    const file = path.resolve(root, "." + (urlPath === "/" ? "/index.html" : urlPath));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {
        "Content-Type": mime.get(path.extname(file)) || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      fs.createReadStream(file).pipe(res);
    });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return {
    url: "http://127.0.0.1:" + server.address().port + "/",
    close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  };
}

async function snapshot(browser, url, viewportWidth, phase) {
  const page = await browser.newPage();
  const exceptions = [];
  try {
    await page.setViewport({ width: viewportWidth, height: 800, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.evaluateOnNewDocument(() => {
      Math.random = () => 0.42;
      HTMLMediaElement.prototype.play = function () {
        return Promise.reject(new DOMException("Deterministic blocked autoplay", "NotAllowedError"));
      };
    });
    page.on("pageerror", e => exceptions.push(String(e)));
    const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => document.body.style.overflow === "hidden");
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }" });
    if (phase === "entered") {
      await page.click("#bloom-skip");
      await page.waitForFunction(() => document.getElementById("bloom-entrance").hidden);
    }
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      await document.fonts.ready;
    });
    const layout = await page.evaluate(() => {
      const ids = [".page-shell", ".zeni-shell", ".zeni-shell__brand", ".journey-main", "#bloom-entrance"];
      return Object.fromEntries(ids.map(selector => {
        const el = document.querySelector(selector);
        if (!el) return [selector, null];
        const box = el.getBoundingClientRect();
        return [selector, {
          x: Math.round(box.x), y: Math.round(box.y),
          width: Math.round(box.width), height: Math.round(box.height),
          hidden: Boolean(el.hidden),
        }];
      }));
    });
    assert.deepEqual(exceptions, []);
    const shot = Buffer.from(await page.screenshot({ type: "png", captureBeyondViewport: false }));
    return { layout, shot, hash: sha(shot) };
  } finally {
    await page.close();
  }
}

test("published baseline and optimized entrance render identically at desktop/mobile widths", { timeout: 120000 }, async () => {
  assert.ok(process.env.CHROME_BIN);
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "zenithoche-compare-"));
  const baselineRoot = path.join(folder, "baseline");
  let baseline = null, candidate = null, browser = null, added = false;
  try {
    execFileSync("git", ["worktree", "add", "--detach", baselineRoot, baselineSha],
      { cwd: candidateRoot, timeout: 60000, maxBuffer: 1024 * 1024 });
    added = true;
    baseline = await serveDir(baselineRoot);
    candidate = await serveDir(candidateRoot);
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN,
      headless: true,
      args: ["--no-sandbox", "--disable-gpu", "--mute-audio"],
    });
    for (const width of [390, 1365]) {
      for (const phase of ["entrance", "entered"]) {
        const original = await snapshot(browser, baseline.url, width, phase);
        const optimized = await snapshot(browser, candidate.url, width, phase);
        assert.deepEqual(optimized.layout, original.layout,
          "Rendered component geometry or visibility changed: " + width + " / " + phase);
        assert.ok(optimized.shot.equals(original.shot),
          "Visual screenshot differs for " + width + " / " + phase +
          " (baseline " + original.hash + ", optimized " + optimized.hash + ")");
        console.log(JSON.stringify({ width, phase, match: "pixel-identical",
          sha256: original.hash }));
      }
    }
  } finally {
    if (browser) await browser.close();
    if (baseline) await baseline.close();
    if (candidate) await candidate.close();
    if (added) execFileSync("git", ["worktree", "remove", "--force", baselineRoot],
      { cwd: candidateRoot, timeout: 30000 });
    fs.rmSync(folder, { recursive: true, force: true });
  }
});
