import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entrance = [0, 1, 2, 3].map(n => "assets/media/bloom-film-0" + n + ".mp4");
const html = readFileSync(join(root, "index.html"), "utf8");
const site = readFileSync(join(root, "assets/js/site.js"), "utf8");

function boxes(buffer) {
  const out = [];
  for (let offset = 0; offset + 8 <= buffer.length;) {
    const size32 = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let header = 8, size = size32;
    if (size32 === 1) {
      if (offset + 16 > buffer.length) throw Error("Truncated extended MP4 box");
      size = Number(buffer.readBigUInt64BE(offset + 8));
      header = 16;
    }
    if (size32 === 0) size = buffer.length - offset;
    assert.ok(Number.isSafeInteger(size) && size >= header, "Invalid MP4 box: " + type);
    assert.ok(offset + size <= buffer.length, "MP4 box exceeds file: " + type);
    out.push({ type, offset, size });
    offset += size;
  }
  return out;
}

test("entrance preserves all four distinct films and interaction controls", () => {
  for (const path of entrance) {
    const relative = "/" + path;
    assert.ok(html.includes('src="' + relative + '"'), "Missing film reference " + relative);
    assert.ok(existsSync(join(root, path)), "Missing film asset " + path);
    const tag = html.match(new RegExp("<video\\b[^>]*src=\"" + relative.replaceAll(".", "\\.") + "\"[^>]*>", "i"));
    assert.ok(tag, "Film must retain a video element: " + path);
    assert.match(tag[0], /\bmuted\b/);
    assert.match(tag[0], /\bplaysinline\b/);
    assert.match(tag[0], /\bpreload="none"/);
  }
  assert.match(html, /id="bloom-sink"[^>]+src="\/assets\/media\/bloom-full-sink\.mp4"/);
  assert.match(html, /id="bloom-trigger"/);
  assert.match(html, /id="bloom-skip"/);
  assert.ok(existsSync(join(root, "assets/media/bloom-full-sink.mp4")));
  assert.ok(existsSync(join(root, "assets/media/bloom-axis-poster.jpg")));
  assert.match(site, /trigger\.addEventListener\("click", startSink\)/);
  assert.match(site, /skip\.addEventListener\("click", enter\)/);
  assert.match(site, /sink\.addEventListener\("ended", enter\)/);
});

test("four entrance films have an upfront MP4 metadata index", () => {
  for (const path of entrance) {
    const data = readFileSync(join(root, path));
    const top = boxes(data);
    const types = top.map(x => x.type);
    assert.equal(types[0], "ftyp", "Missing MP4 file type: " + path);
    const moov = top.find(x => x.type === "moov");
    const mdat = top.find(x => x.type === "mdat");
    assert.ok(moov && mdat, "Required MP4 boxes missing: " + path);
    assert.ok(moov.offset < mdat.offset, "MP4 metadata must precede payload: " + path);
    assert.ok(moov.offset < 65536, "MP4 metadata must be within startup range: " + path);
    assert.ok(data.length > 100000, "Unexpected empty or truncated film: " + path);
  }
});

test("proposed films preserve original stream packets and timing", { skip: !process.env.GITHUB_BASE_SHA }, () => {
  const base = process.env.GITHUB_BASE_SHA;
  assert.match(base, /^[0-9a-f]{40}$/, "Base must be a SHA, not a supplied branch or command");
  const temporary = mkdtempSync(join(tmpdir(), "zenithoche-video-proof-"));
  const probe = path => JSON.parse(execFileSync("ffprobe", [
    "-v", "error", "-show_streams", "-show_packets", "-show_data_hash", "sha256",
    "-of", "json", path,
  ], { maxBuffer: 35 * 1024 * 1024, encoding: "utf8" }));
  try {
    for (let i = 0; i < entrance.length; i++) {
      const path = entrance[i];
      const original = join(temporary, "original-" + i + ".mp4");
      const previous = execFileSync("git", ["show", base + ":" + path], { maxBuffer: 30 * 1024 * 1024 });
      writeFileSync(original, previous);
      const oldProbe = probe(original);
      const newProbe = probe(join(root, path));
      const streamView = x => x.streams.map(s => ({
        codec_type: s.codec_type, codec_name: s.codec_name, time_base: s.time_base,
        start_pts: s.start_pts, duration_ts: s.duration_ts, nb_frames: s.nb_frames,
        width: s.width, height: s.height, sample_rate: s.sample_rate,
      }));
      const packetView = x => x.packets.map(p => ({
        stream_index: p.stream_index, pts: p.pts, dts: p.dts,
        duration: p.duration, flags: p.flags, size: p.size, data_hash: p.data_hash,
      }));
      assert.deepEqual(streamView(newProbe), streamView(oldProbe), "Stream metadata changed: " + path);
      assert.deepEqual(packetView(newProbe), packetView(oldProbe), "Encoded packets or timing changed: " + path);
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
