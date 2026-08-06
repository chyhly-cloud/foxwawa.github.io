import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("/Users/hly/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const assetDir = "/Users/hly/Documents/GitHub/foxwawa/jibunkatte/assets/experiment";
const cutouts = [
  "ai-body-module.webp",
  "ai-body-group.webp",
  "ai-body-parts.webp",
  "ai-body-frag-01.webp",
  "ai-body-frag-02.webp",
  "ai-body-frag-03.webp",
  "ai-body-frag-04.webp",
  "ai-body-frag-05.webp",
  "ai-body-frag-06.webp",
  "ai-soc-clock.webp",
];
const lineArt = [
  "ai-soc-law.webp",
  "ai-life-route-outline-a.webp",
  "ai-life-route-outline-b.webp",
];

const isBackgroundWhite = (r, g, b) => (
  r >= 242 && g >= 242 && b >= 242 && Math.max(r, g, b) - Math.min(r, g, b) <= 14
);

async function removeConnectedWhite(file) {
  const target = path.join(assetDir, file);
  const { data, info } = await sharp(target)
    .flatten({ background: "#ffffff" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = width * height;
  const outside = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let read = 0;
  let write = 0;

  const enqueue = index => {
    if (outside[index]) return;
    const offset = index * channels;
    if (!isBackgroundWhite(data[offset], data[offset + 1], data[offset + 2])) return;
    outside[index] = 1;
    queue[write++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (read < write) {
    const index = queue[read++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }

  for (let i = 0; i < pixels; i += 1) {
    const offset = i * channels;
    data[offset + 3] = outside[i] ? 0 : 255;
  }

  const transparent = await sharp(data, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .extend({
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ lossless: true, quality: 100 })
    .toBuffer();
  await sharp(transparent).toFile(target);
}

async function removeAllWhite(file) {
  const target = path.join(assetDir, file);
  const { data, info } = await sharp(target)
    .flatten({ background: "#ffffff" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = info.width * info.height;
  for (let i = 0; i < pixels; i += 1) {
    const offset = i * info.channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const distance = 255 - Math.min(r, g, b);
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (distance <= 7 && chroma <= 10) data[offset + 3] = 0;
    else if (distance < 24 && chroma <= 16) data[offset + 3] = Math.round((distance - 7) / 17 * 255);
    else data[offset + 3] = 255;
  }
  const transparent = await sharp(data, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .extend({
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ lossless: true, quality: 100 })
    .toBuffer();
  await sharp(transparent).toFile(target);
}

for (const file of cutouts) await removeConnectedWhite(file);
for (const file of lineArt) await removeAllWhite(file);
