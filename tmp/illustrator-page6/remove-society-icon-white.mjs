import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("/Users/hly/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const assetDir = "/Users/hly/Documents/GitHub/foxwawa/jibunkatte/assets/experiment";
const files = [
  "ai-soc-religion-icon.webp",
  "ai-soc-prison-icon.webp",
  "ai-soc-parliament-icon.webp",
  "ai-soc-currency-icon.webp",
  "ai-soc-clock-icon.webp",
  "ai-soc-person-icon.webp",
];

for (const file of files) {
  const target = path.join(assetDir, file);
  const trimmed = await sharp(target)
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 10 })
    .png()
    .toBuffer();
  const { data: alpha, info } = await sharp(trimmed)
    .greyscale()
    .negate()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const transparentIcon = await sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: "#000000",
    },
  })
    .joinChannel(alpha, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 1,
      },
    })
    .extend({
      top: 4,
      right: 4,
      bottom: 4,
      left: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 100, lossless: true })
    .toBuffer();
  await sharp(transparentIcon).toFile(target);
}
