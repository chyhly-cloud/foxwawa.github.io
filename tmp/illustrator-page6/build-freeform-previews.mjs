import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("/Users/hly/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const repo = "/Users/hly/Documents/GitHub/foxwawa";
const assets = path.join(repo, "jibunkatte/assets/experiment");
const out = path.join(repo, "tmp/illustrator-page6");
const paper = { r: 233, g: 236, b: 238, alpha: 1 };

const esc = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

async function prepared(file, width, height, options = {}) {
  const {
    fit = "cover",
    rotate = 0,
    grayscale = false,
    polygon,
    opacity = 1,
  } = options;
  let pipeline = sharp(file).resize({
    width,
    height,
    fit,
    position: options.position || "centre",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (grayscale) pipeline = pipeline.grayscale();
  if (opacity !== 1) {
    pipeline = pipeline.removeAlpha().ensureAlpha(opacity);
  }
  let buffer = await pipeline.png().toBuffer();
  if (polygon) {
    const shape = polygon === "circle"
      ? `<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.47}" fill="white"/>`
      : `<polygon points="${polygon}" fill="white"/>`;
    const mask = Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${shape}
      </svg>`,
    );
    buffer = await sharp(buffer).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  }
  if (rotate) {
    buffer = await sharp(buffer)
      .rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }
  return buffer;
}

function labelSvg(width, height, labels, extra = "") {
  const text = labels
    .map(({ x, y, value, size = 18, weight = 600, fill = "#33383d", family = "Arial" }) =>
      `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`,
    )
    .join("");
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${extra}${text}</svg>`);
}

async function societyPreview() {
  const width = 1500;
  const height = 950;
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
      input: await prepared(path.join(assets, icons[i]), 78, 78, { fit: "contain" }),
      left: 35 + i * 95,
      top: 90 + (i % 2) * 14,
      blend: "over",
    });
  }
  layers.push({
    input: await prepared(path.join(assets, "ai-soc-person-icon.webp"), 90, 110, { fit: "contain" }),
    left: 228,
    top: 225,
    blend: "over",
  });
  const evidence = [
    ["ai-soc-law.webp", 980, 180, 155, 214, "contain", 0, null, "over"],
    ["ai-soc-surveillance.webp", 1139, 180, 155, 165, "cover", 0, null, "over"],
    ["ai-soc-parliament.webp", 1297, 180, 183, 165, "cover", 0, null, "over"],
    ["ai-soc-clock.webp", 980, 396, 155, 134, "contain", 0, null, "over"],
    ["ai-soc-religion.webp", 1297, 347, 183, 183, "cover", 0, null, "over"],
  ];
  for (const [file, x, y, w, h, fit, rot, poly, blend] of evidence) {
    layers.push({
      input: await prepared(path.join(assets, file), w, h, { fit, rotate: rot, grayscale: true, polygon: poly }),
      left: x,
      top: y,
      blend,
    });
  }
  const overlays = `
    <g fill="none" stroke="#ee9418" stroke-width="5">
      <ellipse cx="1058" cy="311" rx="64" ry="47" transform="rotate(-7 1058 311)"/>
      <ellipse cx="1058" cy="311" rx="17" ry="17" transform="rotate(4 1058 311)"/>
      <ellipse cx="1262" cy="217" rx="17" ry="15" transform="rotate(8 1262 217)"/>
      <ellipse cx="1266" cy="271" rx="16" ry="13" transform="rotate(-8 1266 271)"/>
      <ellipse cx="1389" cy="257" rx="73" ry="29" transform="rotate(-3 1389 257)"/>
      <ellipse cx="1057" cy="463" rx="50" ry="50" transform="rotate(4 1057 463)"/>
      <ellipse cx="1389" cy="454" rx="77" ry="28" transform="rotate(2 1389 454)"/>
    </g>
    <g fill="none" stroke="#ee9418" stroke-width="5">
      <ellipse cx="1175" cy="380" rx="23" ry="26"/><ellipse cx="1216" cy="375" rx="19" ry="23"/>
      <ellipse cx="1261" cy="377" rx="26" ry="30"/><ellipse cx="1168" cy="437" rx="27" ry="31"/>
      <ellipse cx="1206" cy="415" rx="14" ry="16"/><ellipse cx="1237" cy="418" rx="17" ry="20"/>
      <ellipse cx="1275" cy="431" rx="23" ry="26"/><ellipse cx="1172" cy="475" rx="19" ry="22"/>
      <ellipse cx="1207" cy="462" rx="16" ry="18"/><ellipse cx="1244" cy="464" rx="19" ry="22"/>
      <ellipse cx="1276" cy="472" rx="16" ry="19"/><ellipse cx="1206" cy="507" rx="27" ry="25"/>
      <ellipse cx="1257" cy="506" rx="23" ry="26"/>
    </g>
    <line x1="520" y1="350" x2="875" y2="350" stroke="#aab1b7" stroke-width="2"/>
    <line x1="520" y1="570" x2="875" y2="570" stroke="#aab1b7" stroke-width="2"/>
  `;
  layers.push({
    input: labelSvg(width, height, [
      { x: 35, y: 55, value: "POWER SYMBOLS → CIRCLE", size: 18, fill: "#6e757b" },
      { x: 520, y: 245, value: "GRAPHIC RESEARCH 01 / SOCIETY", size: 18, fill: "#6e757b" },
      { x: 520, y: 305, value: "将社会形态凝练为圆", size: 38, weight: 500, fill: "#0d0f11" },
      { x: 520, y: 405, value: "法律、监视、议会、时间、货币与宗教中的形态", size: 20, weight: 400 },
      { x: 520, y: 448, value: "彼此并不相同，但都通过圆建立权力的共同轮廓。", size: 20, weight: 400 },
      { x: 520, y: 626, value: "圆成为社会形态的轨道", size: 22, weight: 700, fill: "#0d0f11" },
      { x: 984, y: 198, value: "法律（监狱）", size: 14 },
      { x: 1143, y: 198, value: "生活（监视）", size: 14 },
      { x: 1301, y: 198, value: "权力（议会）", size: 14, fill: "#ffffff" },
      { x: 984, y: 523, value: "时间", size: 14 },
      { x: 1301, y: 520, value: "宗教（祭坛）", size: 14, fill: "#ffffff" },
    ], overlays),
    left: 0,
    top: 0,
  });
  await sharp({ create: { width, height, channels: 4, background: paper } })
    .composite(layers)
    .webp({ quality: 92 })
    .toFile(path.join(out, "society-freeform-visual.webp"));
}

async function lifePreview() {
  const width = 1500;
  const height = 930;
  const layers = [];
  const photos = [
    ["ai-life-sign-01.webp", 35, 80, 170, 145, 0, null],
    ["ai-life-sign-07.webp", 25, 255, 165, 130, 0, null],
    ["ai-life-sign-06.webp", 150, 170, 175, 180, 0, null],
    ["ai-life-sign-04.webp", 160, 360, 165, 150, 0, null],
    ["ai-life-sign-05.webp", 35, 440, 190, 240, 0, null],
    ["ai-life-sign-09.webp", 345, 220, 85, 210, 0, null],
    ["ai-life-sign-12.webp", 415, 120, 150, 170, 0, null],
    ["ai-life-sign-08.webp", 520, 70, 90, 175, 0, null],
    ["ai-life-sign-10.webp", 405, 430, 170, 105, 0, null],
    ["ai-life-sign-11.webp", 510, 490, 105, 205, 0, null],
  ];
  for (const [file, x, y, w, h, rot, poly] of photos) {
    layers.push({
      input: await prepared(path.join(assets, file), w, h, { rotate: rot, polygon: poly }),
      left: x,
      top: y,
    });
  }
  const gps = ["gps-3.jpg", "gps-4.jpg", "gps-5.jpg", "gps-6.jpg", "gps-7.jpg", "gps-8.jpg", "gps-9.jpg"];
  for (let i = 0; i < gps.length; i += 1) {
    layers.push({
      input: await prepared(path.join(repo, "jibunkatte", gps[i]), 245, 300, { fit: "cover", opacity: 0.09 + i * 0.105 }),
      left: 1050 + i * 10,
      top: 350 + i * 8,
      blend: "over",
    });
  }
  layers.push({
    input: await prepared(path.join(assets, "ai-life-route-primary.webp"), 155, 245, { fit: "contain" }),
    left: 1135,
    top: 395,
    blend: "over",
  });
  layers.push({
    input: await prepared(path.join(assets, "ai-life-route-secondary.webp"), 150, 250, { fit: "contain" }),
    left: 1325,
    top: 385,
    blend: "over",
  });
  const overlay = `
    <g fill="#ffe12c" fill-opacity=".58">
      <polygon points="20,505 205,392 326,515 112,600"/>
      <polygon points="175,175 257,146 335,350 222,350"/>
      <polygon points="150,622 235,483 345,615 257,615"/>
    </g>
    <g fill="none" stroke="#e1252e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12 10">
      <path d="M80 115L310 180M77 143L305 210M72 171L298 240M150 98L320 225"/>
      <path d="M28 330C110 314 215 327 312 372"/>
      <path d="M18 414L195 350L326 420M154 370L350 405L325 530L145 475Z"/>
      <path d="M82 675L195 490L305 672M122 688L202 535L264 684"/>
      <path d="M338 472L383 535M326 500L370 572"/>
      <path d="M419 154L558 220L530 298L398 226Z"/>
      <path d="M523 115L610 176L588 244L501 188Z"/>
      <path d="M374 450L570 450L620 520L350 520Z"/>
      <ellipse cx="383" cy="330" rx="28" ry="84"/>
      <ellipse cx="565" cy="132" rx="22" ry="28"/>
    </g>
    <line x1="665" y1="350" x2="1000" y2="350" stroke="#aab1b7" stroke-width="2"/>
    <line x1="665" y1="570" x2="1000" y2="570" stroke="#aab1b7" stroke-width="2"/>
  `;
  layers.push({
    input: labelSvg(width, height, [
      { x: 35, y: 245, value: "显性的记号", size: 18 },
      { x: 485, y: 55, value: "隐性的记号", size: 18 },
      { x: 665, y: 245, value: "GRAPHIC RESEARCH 02 / LIFE", size: 18, fill: "#6e757b" },
      { x: 665, y: 305, value: "提取被生活改变的路径", size: 38, weight: 500, fill: "#0d0f11" },
      { x: 665, y: 405, value: "日常空间中的显性记号与隐性规则彼此重叠，", size: 20, weight: 400 },
      { x: 665, y: 448, value: "共同改变我每天的移动路线。", size: 20, weight: 400 },
      { x: 665, y: 626, value: "变形的线成为个体生活的轨道", size: 22, weight: 700, fill: "#0d0f11" },
      { x: 1080, y: 750, value: "平日生活轨迹的简化", size: 18 },
    ], overlay),
    left: 0,
    top: 0,
  });
  await sharp({ create: { width, height, channels: 4, background: paper } })
    .composite(layers)
    .webp({ quality: 92 })
    .toFile(path.join(out, "life-freeform-visual.webp"));
}

async function individualPreview() {
  const width = 1500;
  const height = 1200;
  const layers = [];
  layers.push({
    input: await prepared(path.join(assets, "ai-body-module.webp"), 430, 190, { fit: "contain" }),
    left: 25,
    top: 40,
    blend: "over",
  });
  const fragments = [
    ["ai-body-group.webp", 25, 220, 165, 165, -2],
    ["ai-body-parts.webp", 158, 220, 180, 175, 1],
    ["ai-body-frag-01.webp", 320, 225, 145, 150, 5],
    ["ai-body-frag-02.webp", 45, 390, 145, 145, -7],
    ["ai-body-frag-03.webp", 176, 405, 145, 145, 4],
    ["ai-body-frag-04.webp", 315, 390, 145, 145, -5],
    ["ai-body-frag-05.webp", 105, 545, 155, 145, 6],
    ["ai-body-frag-06.webp", 260, 540, 150, 145, -4],
  ];
  for (const [file, x, y, w, h, rot] of fragments) {
    layers.push({
      input: await prepared(path.join(assets, file), w, h, { fit: "contain", rotate: rot }),
      left: x,
      top: y,
      blend: "over",
    });
  }
  const casting = [
    ["ai-body-001.webp", 1040, 55, 145, 210, -3],
    ["ai-body-002.webp", 1145, 35, 165, 235, 2],
    ["ai-body-003.webp", 1270, 70, 140, 205, -2],
    ["ai-body-094.webp", 1360, 135, 120, 185, 4],
  ];
  for (const [file, x, y, w, h, rot] of casting) {
    layers.push({
      input: await prepared(path.join(assets, file), w, h, {
        rotate: rot,
        grayscale: true,
        polygon: `6,2 ${w - 6},0 ${w},${h - 20} 9,${h}`,
      }),
      left: x,
      top: y,
    });
  }
  layers.push({
    input: await prepared(path.join(assets, "ai-body-000.webp"), 440, 300, {
      grayscale: true,
      opacity: 0.38,
      polygon: "15,0 440,18 420,300 0,282",
    }),
    left: 1020,
    top: 315,
  });
  const scans = ["ai-body-097.webp", "ai-body-098.webp", "ai-body-099.webp", "ai-body-100.webp"];
  for (let i = 0; i < scans.length; i += 1) {
    layers.push({
      input: await prepared(path.join(assets, scans[i]), 135, 260 + (i % 2) * 10, {
        grayscale: true,
        rotate: [-2, 1.2, -1.5, 2][i],
        polygon: `7,0 130,5 135,250 0,260`,
      }),
      left: 1010 + i * 115,
      top: 395 - (i % 2) * 8,
    });
  }
  const prints = ["ai-body-101.webp", "ai-body-102.webp", "ai-body-103.webp", "ai-body-104.webp", "ai-body-105.webp"];
  for (let i = 0; i < prints.length; i += 1) {
    layers.push({
      input: await prepared(path.join(assets, prints[i]), 110, 135, {
        grayscale: true,
        rotate: [-5, 3, -2, 4, -3][i],
        polygon: "5,0 106,5 110,124 0,135",
      }),
      left: 1000 + i * 95,
      top: 690 + (i % 2) * 10,
    });
  }
  const material = [
    ["ai-body-064.webp", 40, 865, 125, 165, -5],
    ["ai-body-065.webp", 135, 840, 125, 170, 3],
    ["ai-body-066.webp", 230, 880, 125, 160, -3],
    ["ai-body-029.webp", 1025, 890, 125, 165, -5],
    ["ai-body-030.webp", 1125, 855, 130, 180, 3],
    ["ai-body-031.webp", 1225, 890, 125, 165, -3],
  ];
  for (const [file, x, y, w, h, rot] of material) {
    layers.push({
      input: await prepared(path.join(assets, file), w, h, {
        rotate: rot,
        polygon: `6,0 ${w - 4},6 ${w},${h - 12} 0,${h}`,
      }),
      left: x,
      top: y,
    });
  }
  const overlay = `
    <line x1="530" y1="385" x2="955" y2="385" stroke="#aab1b7" stroke-width="2"/>
    <line x1="530" y1="700" x2="955" y2="700" stroke="#aab1b7" stroke-width="2"/>
    <path d="M1090 298C1170 334 1270 331 1375 294" fill="none" stroke="#49a7d8" stroke-width="3" stroke-dasharray="8 10"/>
    <path d="M1195 815C1165 845 1120 865 1070 882" fill="none" stroke="#49a7d8" stroke-width="3" stroke-dasharray="8 10"/>
  `;
  layers.push({
    input: labelSvg(width, height, [
      { x: 25, y: 25, value: "MODULAR BODY → FRAGMENTS", size: 18, fill: "#6e757b" },
      { x: 530, y: 260, value: "EXPERIMENT 03 / INDIVIDUAL", size: 18, fill: "#6e757b" },
      { x: 530, y: 325, value: "拆解被训练的身体，再重新组合", size: 38, weight: 500, fill: "#0d0f11" },
      { x: 530, y: 445, value: "身体被社会训练为多个可以使用和移动的部位，", size: 20, weight: 400 },
      { x: 530, y: 490, value: "再经由石膏翻模、扫描与打印重新认识整体。", size: 20, weight: 400 },
      { x: 530, y: 755, value: "过程不是照片目录，而是一条身体被重组的路径", size: 22, weight: 700, fill: "#0d0f11" },
      { x: 1050, y: 28, value: "手部翻模", size: 17 },
      { x: 1030, y: 345, value: "扫描", size: 17 },
      { x: 1010, y: 840, value: "材料：新闻 / 黏土", size: 17 },
      { x: 40, y: 1080, value: "报纸", size: 17 },
      { x: 1235, y: 1080, value: "黏土", size: 17 },
    ], overlay),
    left: 0,
    top: 0,
  });
  await sharp({ create: { width, height, channels: 4, background: paper } })
    .composite(layers)
    .webp({ quality: 92 })
    .toFile(path.join(out, "individual-freeform-visual.webp"));
}

await Promise.all([societyPreview(), lifePreview(), individualPreview()]);
