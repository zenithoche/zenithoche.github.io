"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const puppeteer = require(path.join(process.env.BROWSER_TEST_TOOLS, "node_modules/puppeteer-core"));

const root = path.resolve(__dirname, "..");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

async function serveLocal() {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const full = path.resolve(root, "." + decodeURIComponent(pathname === "/" ? "/index.html" : pathname));
    if (!full.startsWith(root + path.sep)) {
      res.writeHead(403); res.end(); return;
    }
    fs.stat(full, (err, stat) => {
      if (err || !stat.isFile()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(full)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      fs.createReadStream(full).pipe(res);
    });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    url: "http://127.0.0.1:" + address.port + "/",
    close: () => new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve())),
  };
}

test("Zenithoche enters from Skip and from blocked-video fallback in real Chromium", { timeout: 60000 }, async () => {
  assert.ok(process.env.CHROME_BIN, "Use the runner's preinstalled Chrome; no browser installation in this test");
  const site = await serveLocal();
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--mute-audio"],
  });
  try {
    for (const width of [390, 1365]) {
      for (const action of ["skip", "trigger"]) {
        const page = await browser.newPage();
        try {
          await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
          await page.evaluateOnNewDocument(() => {
            // Deterministic blocked autoplay: UI fallback must remain operable.
            HTMLMediaElement.prototype.play = function () {
              return Promise.reject(new DOMException("Autoplay blocked for test", "NotAllowedError"));
            };
          });
          const errors = [];
          page.on("pageerror", error => errors.push(String(error)));
          const response = await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 20000 });
          assert.equal(response.status(), 200);
          await page.waitForFunction(() => document.body.style.overflow === "hidden", { timeout: 10000 });
          const isLocked = await page.$eval(".page-shell", el => el.inert);
          assert.equal(isLocked, true, "Entrance must lock page controls before entry");
          await page.click(action === "skip" ? "#bloom-skip" : "#bloom-trigger");
          await page.waitForFunction(
            () => document.getElementById("bloom-entrance").hidden &&
              !document.documentElement.classList.contains("bloom-enabled"),
            { timeout: 10000 },
          );
          assert.equal(await page.$eval(".page-shell", el => el.inert), false,
            "Entrance must release the page after entry");
          assert.equal(await page.$eval(".zeni-shell__brand", el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }), true, "Brand navigation must remain laid out");
          assert.deepEqual(errors, [], "Unexpected JavaScript errors during entrance");
          console.log(JSON.stringify({ viewportWidth: width, action, result: "entered" }));
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
    await site.close();
  }
});
