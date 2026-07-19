import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { chromium } from "@playwright/test";
import { getReferenceCrop } from "../src/referenceCrops.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "artifacts/visual/scene-39");
const BASE_URL = "http://127.0.0.1:4173";
const VIEWPORT = { width: 1920, height: 1080 };

const URLS = Object.freeze({
  reference:
    "/?output=obs&render=composite&scene=39&mode=reference&clean=true&paused=true&bgVideo=false",
  live: "/?output=obs&render=composite&scene=39&mode=live&clean=true&paused=true&bgVideo=false",
  overlay:
    "/?output=obs&render=composite&scene=39&mode=overlay&clean=true&paused=true&bgVideo=false&refOpacity=0.5&refOnTop=true&overlayView=both",
});

const ARGS = new Set(process.argv.slice(2));
const SAVE_BEFORE = ARGS.has("--save-before");
const THRESHOLD = 0.12;

function clampRect(rect, width, height) {
  const x = Math.max(0, Math.min(width, Math.floor(rect.x)));
  const y = Math.max(0, Math.min(height, Math.floor(rect.y)));
  const w = Math.max(0, Math.min(width - x, Math.ceil(rect.width)));
  const h = Math.max(0, Math.min(height - y, Math.ceil(rect.height)));
  return { x, y, width: w, height: h };
}

function formatPct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readPng(filePath) {
  const buffer = await fs.readFile(filePath);
  return PNG.sync.read(buffer);
}

async function writePng(filePath, png) {
  const encoded = PNG.sync.write(png);
  await fs.writeFile(filePath, encoded);
}

async function waitForStableStage(page) {
  await page.waitForSelector("[data-visual-stage]");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(
      images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) =>
          image.addEventListener("load", resolve, { once: true }),
        );
      }),
    );
    await Promise.all(
      images.map((image) =>
        typeof image.decode === "function"
          ? image.decode().catch(() => undefined)
          : Promise.resolve(),
      ),
    );
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}

async function captureStage(page, url, outFile) {
  await page.goto(`${BASE_URL}${url}`, { waitUntil: "domcontentloaded" });
  await waitForStableStage(page);

  const stage = page.locator("[data-visual-stage]");
  await stage.screenshot({ path: outFile });

  const png = await readPng(outFile);
  if (png.width !== VIEWPORT.width || png.height !== VIEWPORT.height) {
    throw new Error(
      `Unexpected screenshot size for ${outFile}: ${png.width}x${png.height}`,
    );
  }

  const meta = await page.evaluate(() => {
    const stage = document.querySelector("[data-visual-stage]");
    if (!stage) return null;
    const stageRect = stage.getBoundingClientRect();
    const regions = {};
    document.querySelectorAll("[data-match-region]").forEach((node) => {
      const key = node.getAttribute("data-match-region");
      if (!key || regions[key]) return;
      const box = node.getBoundingClientRect();
      regions[key] = {
        x: box.left - stageRect.left,
        y: box.top - stageRect.top,
        width: box.width,
        height: box.height,
      };
    });
    const presenter = document.querySelector("[data-presenter-safe-zone]");
    const presenterRect = presenter
      ? (() => {
          const box = presenter.getBoundingClientRect();
          return {
            x: box.left - stageRect.left,
            y: box.top - stageRect.top,
            width: box.width,
            height: box.height,
          };
        })()
      : null;

    return {
      stage: { width: stageRect.width, height: stageRect.height },
      regions,
      presenterRect,
    };
  });

  return {
    path: outFile,
    width: png.width,
    height: png.height,
    meta,
  };
}

function buildExcludedMask(width, height, presenterRect) {
  const excluded = new Uint8Array(width * height);
  let excludedCount = 0;

  const rect = presenterRect
    ? clampRect(presenterRect, width, height)
    : { x: 0, y: 0, width: Math.floor(width * 0.3), height };

  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const idx = y * width + x;
      if (!excluded[idx]) {
        excluded[idx] = 1;
        excludedCount += 1;
      }
    }
  }

  return { excluded, excludedCount, presenterMask: rect };
}

function compareImages(
  referencePng,
  targetPng,
  excludedMask,
  outputPath,
  bounds = null,
) {
  if (
    referencePng.width !== targetPng.width ||
    referencePng.height !== targetPng.height
  ) {
    throw new Error("Image dimensions do not match for comparison.");
  }

  const width = bounds ? bounds.width : referencePng.width;
  const height = bounds ? bounds.height : referencePng.height;
  const startX = bounds ? bounds.x : 0;
  const startY = bounds ? bounds.y : 0;

  const refView = new PNG({ width, height });
  const targetView = new PNG({ width, height });
  const diff = new PNG({ width, height });

  let comparedPixelCount = 0;
  let excludedPixelCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = startX + x;
      const sourceY = startY + y;
      const sourceIndex = sourceY * referencePng.width + sourceX;
      const sourceOffset = sourceIndex * 4;
      const targetOffset = (y * width + x) * 4;

      const isExcluded = excludedMask[sourceIndex] === 1;
      if (isExcluded) {
        excludedPixelCount += 1;
      } else {
        comparedPixelCount += 1;
      }

      const r = referencePng.data[sourceOffset];
      const g = referencePng.data[sourceOffset + 1];
      const b = referencePng.data[sourceOffset + 2];
      const a = referencePng.data[sourceOffset + 3];

      refView.data[targetOffset] = r;
      refView.data[targetOffset + 1] = g;
      refView.data[targetOffset + 2] = b;
      refView.data[targetOffset + 3] = a;

      if (isExcluded) {
        targetView.data[targetOffset] = r;
        targetView.data[targetOffset + 1] = g;
        targetView.data[targetOffset + 2] = b;
        targetView.data[targetOffset + 3] = a;
      } else {
        targetView.data[targetOffset] = targetPng.data[sourceOffset];
        targetView.data[targetOffset + 1] = targetPng.data[sourceOffset + 1];
        targetView.data[targetOffset + 2] = targetPng.data[sourceOffset + 2];
        targetView.data[targetOffset + 3] = targetPng.data[sourceOffset + 3];
      }
    }
  }

  const mismatchedPixels = pixelmatch(
    refView.data,
    targetView.data,
    diff.data,
    width,
    height,
    {
      threshold: THRESHOLD,
      includeAA: false,
      alpha: 0.6,
    },
  );

  if (outputPath) {
    writePng(outputPath, diff);
  }

  const mismatchRatio =
    comparedPixelCount === 0 ? 0 : mismatchedPixels / comparedPixelCount;
  const similarity = 1 - mismatchRatio;

  return {
    width,
    height,
    comparedPixelCount,
    excludedPixelCount,
    mismatchedPixels,
    mismatchRatio,
    visualSimilarity: similarity,
  };
}

function compareRegions(referencePng, targetPng, excludedMask, regions) {
  const entries = Object.entries(regions);
  const results = {};
  for (const [name, rawRect] of entries) {
    const rect = clampRect(rawRect, referencePng.width, referencePng.height);
    if (rect.width === 0 || rect.height === 0) {
      results[name] = {
        width: rect.width,
        height: rect.height,
        comparedPixelCount: 0,
        excludedPixelCount: 0,
        mismatchedPixels: 0,
        mismatchRatio: 0,
        visualSimilarity: 1,
      };
      continue;
    }
    results[name] = compareImages(
      referencePng,
      targetPng,
      excludedMask,
      null,
      rect,
    );
  }
  return results;
}

function summarizeDifferences(after, regionAfter) {
  const differences = [];
  if (after.visualSimilarity < 0.95) {
    differences.push(
      `Overall similarity is below target: ${formatPct(after.visualSimilarity)}.`,
    );
  }

  for (const [region, stats] of Object.entries(regionAfter)) {
    if (stats.visualSimilarity < 0.9) {
      differences.push(
        `${region} is below 90% similarity (${formatPct(stats.visualSimilarity)}).`,
      );
      continue;
    }
    if (
      [
        "headline",
        "qr",
        "cta-dashboard",
        "cta-looplink",
        "cta-community",
        "footer",
      ].includes(region) &&
      stats.visualSimilarity < 0.95
    ) {
      differences.push(
        `${region} is below 95% target (${formatPct(stats.visualSimilarity)}).`,
      );
    }
  }

  return differences;
}

function toReportTable(title, stats) {
  const rows = Object.entries(stats)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(
      ([name, result]) =>
        `| ${name} | ${formatPct(result.visualSimilarity)} | ${result.mismatchedPixels} | ${result.comparedPixelCount} |`,
    )
    .join("\n");

  return `## ${title}\n\n| Region | Similarity | Mismatched Pixels | Compared Pixels |\n| --- | ---: | ---: | ---: |\n${rows}\n`;
}

async function main() {
  await ensureDir(OUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: "light",
  });
  const page = await context.newPage();

  const referenceCapture = await captureStage(
    page,
    URLS.reference,
    path.join(OUT_DIR, "reference.png"),
  );
  if (!referenceCapture.meta)
    throw new Error("Unable to read stage metadata from reference capture.");

  const liveBeforePath = path.join(OUT_DIR, "live-before.png");
  if (SAVE_BEFORE) {
    await captureStage(page, URLS.live, liveBeforePath);
  }

  const liveAfterCapture = await captureStage(
    page,
    URLS.live,
    path.join(OUT_DIR, "live-after.png"),
  );
  const overlayCapture = await captureStage(
    page,
    URLS.overlay,
    path.join(OUT_DIR, "overlay.png"),
  );

  await context.close();
  await browser.close();

  const referencePng = await readPng(referenceCapture.path);
  const liveAfterPng = await readPng(liveAfterCapture.path);

  let liveBeforePng = null;
  try {
    liveBeforePng = await readPng(liveBeforePath);
  } catch {
    liveBeforePng = null;
  }

  const presenterRect = liveAfterCapture.meta?.presenterRect;
  const { excluded, excludedCount, presenterMask } = buildExcludedMask(
    referencePng.width,
    referencePng.height,
    presenterRect,
  );

  let beforeStats = null;
  let beforeRegions = null;
  if (liveBeforePng) {
    beforeStats = compareImages(
      referencePng,
      liveBeforePng,
      excluded,
      path.join(OUT_DIR, "diff-before.png"),
    );
    beforeRegions = compareRegions(
      referencePng,
      liveBeforePng,
      excluded,
      liveAfterCapture.meta?.regions ?? {},
    );
  }

  const afterStats = compareImages(
    referencePng,
    liveAfterPng,
    excluded,
    path.join(OUT_DIR, "diff-after.png"),
  );
  const afterRegions = compareRegions(
    referencePng,
    liveAfterPng,
    excluded,
    liveAfterCapture.meta?.regions ?? {},
  );

  const remainingDifferences = summarizeDifferences(afterStats, afterRegions);
  const crop = getReferenceCrop("39");

  const report = {
    scene: "39",
    generatedAt: new Date().toISOString(),
    viewport: VIEWPORT,
    urls: URLS,
    referenceCrop: crop,
    screenshotDimensions: {
      reference: {
        width: referenceCapture.width,
        height: referenceCapture.height,
      },
      liveBefore: liveBeforePng
        ? { width: liveBeforePng.width, height: liveBeforePng.height }
        : null,
      liveAfter: {
        width: liveAfterCapture.width,
        height: liveAfterCapture.height,
      },
      overlay: { width: overlayCapture.width, height: overlayCapture.height },
    },
    mask: {
      excludedPixelCount: excludedCount,
      presenterMask,
      source: presenterRect
        ? "data-presenter-safe-zone"
        : "fallback-left-30-percent",
      antiAliasing: "pixelmatch includeAA=false, threshold=0.12",
    },
    before: beforeStats
      ? {
          comparedPixelCount: beforeStats.comparedPixelCount,
          excludedPixelCount: beforeStats.excludedPixelCount,
          mismatchedPixels: beforeStats.mismatchedPixels,
          mismatchRatio: beforeStats.mismatchRatio,
          visualSimilarity: beforeStats.visualSimilarity,
          regions: beforeRegions,
        }
      : null,
    after: {
      comparedPixelCount: afterStats.comparedPixelCount,
      excludedPixelCount: afterStats.excludedPixelCount,
      mismatchedPixels: afterStats.mismatchedPixels,
      mismatchRatio: afterStats.mismatchRatio,
      visualSimilarity: afterStats.visualSimilarity,
      regions: afterRegions,
    },
    remainingDifferences,
  };

  await fs.writeFile(
    path.join(OUT_DIR, "report.json"),
    JSON.stringify(report, null, 2),
  );

  const markdown = [
    "# Scene 39 Visual Comparison Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Reference Crop",
    "",
    `- sourceWidth: ${crop.sourceWidth}`,
    `- sourceHeight: ${crop.sourceHeight}`,
    `- composition: x=${crop.composition.x}, y=${crop.composition.y}, width=${crop.composition.width}, height=${crop.composition.height}`,
    "",
    "## Primary Score (Masked)",
    "",
    beforeStats
      ? `- Before similarity: ${formatPct(beforeStats.visualSimilarity)} (${beforeStats.mismatchedPixels}/${beforeStats.comparedPixelCount} mismatched)`
      : "- Before similarity: unavailable (run with --save-before first)",
    `- After similarity: ${formatPct(afterStats.visualSimilarity)} (${afterStats.mismatchedPixels}/${afterStats.comparedPixelCount} mismatched)`,
    `- Excluded pixels: ${excludedCount}`,
    `- Presenter mask: x=${presenterMask.x}, y=${presenterMask.y}, width=${presenterMask.width}, height=${presenterMask.height}`,
    "",
    beforeRegions
      ? toReportTable("Per-Region Before", beforeRegions)
      : "## Per-Region Before\n\nUnavailable until live-before.png exists.\n",
    toReportTable("Per-Region After", afterRegions),
    "## Remaining Differences",
    "",
    ...(remainingDifferences.length > 0
      ? remainingDifferences.map((item) => `- ${item}`)
      : ["- None."]),
    "",
    "## Artifact Paths",
    "",
    "- reference.png",
    "- live-before.png",
    "- live-after.png",
    "- overlay.png",
    "- diff-before.png",
    "- diff-after.png",
    "- report.json",
    "- report.md",
  ].join("\n");

  await fs.writeFile(path.join(OUT_DIR, "report.md"), `${markdown}\n`);

  const summaryLine = beforeStats
    ? `Scene 39 compare complete. Before: ${formatPct(beforeStats.visualSimilarity)} | After: ${formatPct(afterStats.visualSimilarity)}.`
    : `Scene 39 compare complete. After: ${formatPct(afterStats.visualSimilarity)} (run with --save-before to capture baseline).`;
  console.log(summaryLine);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
