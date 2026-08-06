import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("/Users/hly/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const repo = "/Users/hly/Documents/GitHub/foxwawa";
const assets = path.join(repo, "jibunkatte/assets/experiment");
const out = path.join(repo, "tmp/illustrator-page6");
const paper = { r: 233, g: 236, b: 238, alpha: 1 };

async function image(file, width, height, { fit = "cover", grayscale = false, opacity = 1 } = {}) {
  let pipe = sharp(file).resize({
    width,
    height,
    fit,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (grayscale) pipe = pipe.grayscale();
  if (opacity !== 1) pipe = pipe.removeAlpha().ensureAlpha(opacity);
  return pipe.png().toBuffer();
}

const textLayer = (width, height, markup) => Buffer.from(
  `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`,
);

async function society() {
  const width = 1500;
  const height = 1000;
  const layers = [];

  const icons = [
    "ai-soc-religion-icon.webp",
    "ai-soc-prison-icon.webp",
    "ai-soc-parliament-icon.webp",
    "ai-soc-currency-icon.webp",
    "ai-soc-clock-icon.webp",
  ];
  for (let i = 0; i < icons.length; i += 1) {
    layers.push({
      input: await image(path.join(assets, icons[i]), 68, 68, { fit: "contain" }),
      left: 25 + i * 77,
      top: 62 + (i % 2) * 12,
    });
  }
  layers.push({
    input: await image(path.join(assets, "ai-soc-person-icon.webp"), 78, 94, { fit: "contain" }),
    left: 174,
    top: 190,
  });

  const proofs = [
    ["ai-soc-law.webp", 22, 270, 285, 403, "contain"],
    ["ai-soc-surveillance.webp", 1208, 50, 232, 349, "cover"],
    ["ai-soc-parliament.webp", 1110, 320, 375, 236, "cover"],
    ["ai-soc-clock.webp", 240, 720, 173, 177, "contain"],
    ["ai-soc-religion.webp", 1140, 700, 330, 248, "cover"],
  ];
  for (const [file, left, top, w, h, fit] of proofs) {
    layers.push({
      input: await image(path.join(assets, file), w, h, { fit, grayscale: true }),
      left,
      top,
    });
  }

  const marks = `
    <g fill="none" stroke="#eb8a1a" stroke-width="5">
      <ellipse cx="164" cy="488" rx="117" ry="89" transform="rotate(-7 164 488)"/>
      <ellipse cx="164" cy="506" rx="32" ry="32" transform="rotate(4 164 506)"/>
      <ellipse cx="1380" cy="99" rx="26" ry="31" transform="rotate(8 1380 99)"/>
      <ellipse cx="1382" cy="218" rx="23" ry="27" transform="rotate(-8 1382 218)"/>
      <ellipse cx="1298" cy="438" rx="150" ry="42" transform="rotate(-3 1298 438)"/>
      <ellipse cx="326" cy="807" rx="55" ry="56" transform="rotate(4 326 807)"/>
      <ellipse cx="1305" cy="834" rx="139" ry="38" transform="rotate(2 1305 834)"/>
      <ellipse cx="59" cy="777" rx="31" ry="29"/><ellipse cx="111" cy="777" rx="26" ry="25"/>
      <ellipse cx="174" cy="778" rx="34" ry="34"/><ellipse cx="51" cy="837" rx="36" ry="35"/>
      <ellipse cx="105" cy="820" rx="18" ry="18"/><ellipse cx="144" cy="821" rx="23" ry="23"/>
      <ellipse cx="190" cy="838" rx="30" ry="29"/><ellipse cx="62" cy="888" rx="26" ry="25"/>
      <ellipse cx="109" cy="879" rx="20" ry="20"/><ellipse cx="156" cy="882" rx="26" ry="25"/>
      <ellipse cx="199" cy="892" rx="21" ry="21"/><ellipse cx="118" cy="933" rx="36" ry="28"/>
      <ellipse cx="177" cy="931" rx="30" ry="29"/>
    </g>
    <g fill="#6e757b" font-family="Arial" font-size="17" font-weight="600">
      <text x="22" y="328">法律（监狱）</text>
      <text x="1210" y="76">生活（监视）</text>
      <text x="1118" y="349" fill="#fff">权力（议会）</text>
      <text x="242" y="925">时间</text>
      <text x="1148" y="730" fill="#fff">宗教（祭坛）</text>
    </g>
    <g fill="#0d0f11" font-family="Arial">
      <text x="510" y="282" font-size="18" font-weight="600" letter-spacing="2">GRAPHIC RESEARCH 01 / SOCIETY</text>
      <text x="510" y="345" font-size="38">将社会形态凝练为圆</text>
      <text x="510" y="430" font-size="20">法律、监视、议会、时间、货币与宗教中的形态</text>
      <text x="510" y="472" font-size="20">彼此并不相同，却都通过圆形成共同的权力轮廓。</text>
      <line x1="510" y1="544" x2="990" y2="544" stroke="#aab1b7" stroke-width="2"/>
      <text x="510" y="610" font-size="22" font-weight="700">圆成为社会形态的轨道</text>
    </g>
  `;
  layers.push({ input: textLayer(width, height, marks), left: 0, top: 0 });

  await sharp({ create: { width, height, channels: 4, background: paper } })
    .composite(layers)
    .webp({ quality: 92 })
    .toFile(path.join(out, "society-scatter-visual.webp"));
}

async function life() {
  const width = 1500;
  const height = 1000;
  const layers = [];

  const explicit = [
    ["ai-life-sign-01.webp", 28, 70, 193, 126],
    ["ai-life-sign-07.webp", 18, 228, 172, 121],
    ["ai-life-sign-06.webp", 166, 132, 214, 179],
    ["ai-life-sign-04.webp", 157, 314, 206, 132],
    ["ai-life-sign-05.webp", 40, 376, 206, 194],
  ];
  const implicit = [
    ["ai-life-sign-09.webp", 1076, 160, 126, 197],
    ["ai-life-sign-12.webp", 1160, 90, 198, 157],
    ["ai-life-sign-08.webp", 1348, 50, 113, 157],
    ["ai-life-sign-10.webp", 1182, 306, 223, 101],
    ["ai-life-sign-11.webp", 1360, 346, 109, 177],
  ];
  for (const [file, left, top, w, h] of [...explicit, ...implicit]) {
    layers.push({ input: await image(path.join(assets, file), w, h), left, top });
  }

  const gps = ["gps-3.jpg", "gps-4.jpg", "gps-5.jpg", "gps-6.jpg", "gps-7.jpg", "gps-8.jpg", "gps-9.jpg"];
  for (let i = 0; i < gps.length; i += 1) {
    layers.push({
      input: await image(path.join(repo, "jibunkatte", gps[i]), 240, 260, {
        fit: "cover",
        opacity: 0.09 + i * 0.105,
      }),
      left: 1090 + i * 10,
      top: 650 + i * 7,
    });
  }
  layers.push({
    input: await image(path.join(assets, "ai-life-route-primary.webp"), 145, 220, { fit: "contain" }),
    left: 1170,
    top: 683,
  });
  layers.push({
    input: await image(path.join(assets, "ai-life-route-secondary.webp"), 145, 220, { fit: "contain" }),
    left: 1332,
    top: 687,
  });

  const marks = `
    <g fill="#ffe12c" fill-opacity=".58">
      <polygon points="0,343 189,247 378,356 105,446"/>
      <polygon points="168,116 255,93 372,272 228,277"/>
      <polygon points="118,510 221,350 380,504 260,505"/>
    </g>
    <g fill="none" stroke="#e1252e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12 10">
      <path d="M29 71L362 132M27 94L355 159M24 120L346 185M120 57L368 174"/>
      <path d="M13 251C119 231 231 247 364 302"/>
      <path d="M6 327L197 254L384 339M172 289L393 320L368 450L160 387Z"/>
      <path d="M52 550L215 359L342 551M101 560L216 405L295 558"/>
      <path d="M319 366L402 421M307 396L386 459"/>
      <path d="M1152 89L1350 162L1316 248L1125 178Z"/>
      <path d="M1237 133L1405 199L1367 269L1207 207Z"/>
      <path d="M1125 352L1418 352L1460 419L1096 419Z"/>
      <path d="M1377 357C1450 365 1486 420 1474 526L1360 515C1364 445 1363 394 1377 357Z"/>
      <ellipse cx="1138" cy="252" rx="37" ry="91"/>
      <ellipse cx="1404" cy="106" rx="29" ry="34"/>
    </g>
    <g fill="#0d0f11" font-family="Arial">
      <text x="22" y="220" font-size="18" font-weight="700">显性的记号</text>
      <text x="1328" y="45" font-size="18" font-weight="700">隐性的记号</text>
      <text x="510" y="282" font-size="18" font-weight="600" letter-spacing="2">GRAPHIC RESEARCH 02 / LIFE</text>
      <text x="510" y="345" font-size="38">提取被生活改变的路径</text>
      <text x="510" y="430" font-size="20">日常空间中的显性记号与隐性规则分处两侧，</text>
      <text x="510" y="472" font-size="20">共同改变每天的移动路线。</text>
      <line x1="510" y1="544" x2="990" y2="544" stroke="#aab1b7" stroke-width="2"/>
      <text x="510" y="610" font-size="22" font-weight="700">变形的线成为个体生活的轨道</text>
      <text x="1110" y="958" font-size="17" fill="#6e757b">平日生活轨迹的简化</text>
    </g>
  `;
  layers.push({ input: textLayer(width, height, marks), left: 0, top: 0 });

  await sharp({ create: { width, height, channels: 4, background: paper } })
    .composite(layers)
    .webp({ quality: 92 })
    .toFile(path.join(out, "life-scatter-visual.webp"));
}

await Promise.all([society(), life()]);
