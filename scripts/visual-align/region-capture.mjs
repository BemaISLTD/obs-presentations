import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import scene39 from "./config/scene39.mjs";
import { ensureDir, captureStage, withBrowser, VIEWPORT } from "./capture.mjs";
import { readPng, compareImages, writePng, writeCrop } from "./compare.mjs";
import {
  normalizeSceneId,
  parseArgs,
  expandRect,
  roundBox,
  boxDelta,
  sizeDeltaRatio,
} from "./geometry.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_BASE_URL = "http://127.0.0.1:5173";

const CONFIG_BY_SCENE = Object.freeze({
  "39": scene39,
});

function loadConfig(sceneId) {
  const config = CONFIG_BY_SCENE[sceneId];
  if (!config) {
    throw new Error(`No visual alignment config found for scene ${sceneId}.`);
  }
  return config;
}

async function annotateTarget(referencePath, crop, expected, label, outFile) {
  const relative = {
    x: expected.x - crop.x,
    y: expected.y - crop.y,
    width: expected.width,
    height: expected.height,
  };
  const svg = `
    <svg width="${crop.width}" height="${crop.height}" viewBox="0 0 ${crop.width} ${crop.height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${relative.x}" y="${relative.y}" width="${relative.width}" height="${relative.height}" fill="none" stroke="#ef4444" stroke-width="4" rx="8" />
      <rect x="${relative.x}" y="${Math.max(0, relative.y - 30)}" width="340" height="26" fill="rgba(239,68,68,.92)" rx="4" />
      <text x="${relative.x + 8}" y="${Math.max(18, relative.y - 11)}" font-size="16" fill="#fff">${label}: ${expected.x},${expected.y},${expected.width},${expected.height}</text>
    </svg>
  `;
  await sharp(referencePath)
    .extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height })
    .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
    .png()
    .toFile(outFile);
}

export async function captureRegion(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const sceneId = normalizeSceneId(args.scene ?? "39");
  const regionName = String(args.region ?? "");
  const cycle = String(args.cycle ?? "00").padStart(2, "0");
  const baseUrl = String(args.baseUrl ?? DEFAULT_BASE_URL);
  const config = loadConfig(sceneId);
  const targets = {
    ...config.regions,
    ...(config.analysisTargets ?? {}),
  };
  const region = targets[regionName];
  if (!region) {
    throw new Error(`Unknown region '${regionName}' for scene ${sceneId}.`);
  }

  const expected = roundBox(region.expected);
  const crop = expandRect(expected, config.cropPadding ?? 50, VIEWPORT.width, VIEWPORT.height);
  const referencePath = path.join(ROOT, config.referencePath);
  const outputDir = path.join(ROOT, "artifacts", "visual", `scene-${sceneId}`, `pass-${config.pass}`, "regions-final");
  const cycleDir = path.join(outputDir, `${regionName}-cycles`, `cycle-${cycle}`);
  await ensureDir(outputDir);
  await ensureDir(cycleDir);

  const fullPaths = {
    reference: path.join(cycleDir, "reference-full.png"),
    live: path.join(cycleDir, "live-full.png"),
    overlay: path.join(cycleDir, "overlay-full.png"),
  };
  const cropPaths = {
    reference: path.join(cycleDir, `${regionName}-reference.png`),
    live: path.join(cycleDir, `${regionName}-live.png`),
    overlay: path.join(cycleDir, `${regionName}-overlay.png`),
    diff: path.join(cycleDir, `${regionName}-diff.png`),
    annotated: path.join(cycleDir, `${regionName}-target-annotated.png`),
  };

  const captures = await withBrowser(async (page) => {
    const reference = await captureStage({
      page,
      baseUrl,
      url: config.urls.reference,
      outputPath: fullPaths.reference,
      regions: targets,
      presenterSelector: config.presenterExclusion.selector,
    });
    const live = await captureStage({
      page,
      baseUrl,
      url: config.urls.live,
      outputPath: fullPaths.live,
      regions: targets,
      presenterSelector: config.presenterExclusion.selector,
    });
    const overlay = await captureStage({
      page,
      baseUrl,
      url: config.urls.overlay,
      outputPath: fullPaths.overlay,
      regions: targets,
      presenterSelector: config.presenterExclusion.selector,
    });
    return { reference, live, overlay };
  });

  await writeCrop(fullPaths.reference, crop, cropPaths.reference);
  await writeCrop(fullPaths.live, crop, cropPaths.live);
  await writeCrop(fullPaths.overlay, crop, cropPaths.overlay);
  await annotateTarget(referencePath, crop, expected, region.label, cropPaths.annotated);

  const referencePng = await readPng(cropPaths.reference);
  const livePng = await readPng(cropPaths.live);
  const overlayPng = await readPng(cropPaths.overlay);
  const diff = compareImages(referencePng, livePng);
  const overlayMetrics = compareImages(referencePng, overlayPng);
  await writePng(cropPaths.diff, diff.diff);

  for (const [key, source] of Object.entries(cropPaths)) {
    const finalName = `${regionName}-${key === "annotated" ? "target-annotated" : key}.png`;
    await fs.copyFile(source, path.join(outputDir, finalName));
  }

  const actual = roundBox(captures.live.meta.regions?.[regionName] ?? null);
  const delta = boxDelta(expected, actual);
  const ratios = sizeDeltaRatio(expected, actual);
  const metrics = {
    sceneId,
    region: regionName,
    cycle,
    expected,
    actual,
    delta,
    widthDeltaRatio: ratios.width,
    heightDeltaRatio: ratios.height,
    crop,
    similarity: diff.similarity,
    ssim: diff.ssim,
    edgeOverlapRatio: diff.edgeOverlapRatio,
    overlaySimilarity: overlayMetrics.similarity,
    overlaySSIM: overlayMetrics.ssim,
  };

  await fs.writeFile(path.join(cycleDir, "metrics.json"), JSON.stringify(metrics, null, 2));
  return metrics;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  captureRegion()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}