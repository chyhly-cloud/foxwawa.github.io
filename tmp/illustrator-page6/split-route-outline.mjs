import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("/Users/hly/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const assetDir = "/Users/hly/Documents/GitHub/foxwawa/jibunkatte/assets/experiment";
const source = path.join(assetDir, "ai-life-route-outline-a.webp");
const { width, height } = await sharp(source).metadata();

const crops = [
  {
    name: "ai-life-route-primary.webp",
    left: 0,
    top: 0,
    width: Math.round(width * 0.27),
    height,
  },
  {
    name: "ai-life-route-secondary.webp",
    left: Math.round(width * 0.72),
    top: 0,
    width: width - Math.round(width * 0.72),
    height,
  },
];

for (const crop of crops) {
  const extracted = await sharp(source)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .png()
    .toBuffer();
  const buffer = await sharp(extracted)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .extend({
      top: 4,
      right: 4,
      bottom: 4,
      left: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ lossless: true, quality: 100 })
    .toBuffer();
  await sharp(buffer).toFile(path.join(assetDir, crop.name));
}
