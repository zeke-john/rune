import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

interface RuneFrameRow {
  0: string;
  1: string[];
}

interface RuneAnimation {
  version: 1;
  meta: {
    name: string;
    fps: number;
    columns: number;
    rows: number;
    frameCount: number;
    colored: boolean;
    generatedWith: {
      thresholdLow: number;
      thresholdHigh: number;
      chars: string;
      fontRatio: number;
    };
  };
  frames: RuneFrameRow[][];
}

const FRAMES_DIR = resolve("site/public/frames-loadergood");
const OUTPUT_DIR = resolve("packages/runeAscii/src/animations");

const frameFiles = readdirSync(FRAMES_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

console.log(`Found ${frameFiles.length} frame files in ${FRAMES_DIR}`);

const frames: RuneFrameRow[][] = [];
let columns = 0;
let rows = 0;

for (const file of frameFiles) {
  const raw = readFileSync(join(FRAMES_DIR, file), "utf-8");
  const frame: RuneFrameRow[] = JSON.parse(raw);

  if (frames.length === 0) {
    rows = frame.length;
    columns = frame[0]?.[0]?.length ?? 0;
    console.log(`Detected grid: ${columns} columns x ${rows} rows`);
  }

  frames.push(frame);
}

const animation: RuneAnimation = {
  version: 1,
  meta: {
    name: "loaderGood",
    fps: 30,
    columns,
    rows,
    frameCount: frames.length,
    colored: true,
    generatedWith: {
      thresholdLow: 5,
      thresholdHigh: 235,
      chars: " .~-_=+*%#0oOxX@$",
      fontRatio: 0.44,
    },
  },
  frames,
};

mkdirSync(OUTPUT_DIR, { recursive: true });

const outputPath = join(OUTPUT_DIR, "loaderGood.rune.json");
writeFileSync(outputPath, JSON.stringify(animation));

const sizeBytes = readFileSync(outputPath).byteLength;
const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);

console.log(`Wrote ${outputPath}`);
console.log(`  ${frames.length} frames, ${columns}x${rows} grid`);
console.log(`  File size: ${sizeMB} MB`);
