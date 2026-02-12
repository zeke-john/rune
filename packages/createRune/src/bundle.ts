import { writeFileSync } from "node:fs";
import { statSync } from "node:fs";

interface BundleOptions {
  name: string;
  fps: number;
  columns: number;
  colored: boolean;
  thresholdLow: number;
  thresholdHigh: number;
  chars: string;
  fontRatio: number;
}

export function bundleAnimation(
  frames: [string, string[]][][],
  outputPath: string,
  options: BundleOptions,
) {
  const firstFrame = frames[0];
  const rows = firstFrame ? firstFrame.length : 0;
  const cols = firstFrame?.[0]?.[0]?.length ?? 0;

  const animation = {
    version: 1,
    meta: {
      name: options.name,
      fps: options.fps,
      columns: cols,
      rows,
      frameCount: frames.length,
      colored: options.colored,
      generatedWith: {
        thresholdLow: options.thresholdLow,
        thresholdHigh: options.thresholdHigh,
        chars: options.chars,
        fontRatio: options.fontRatio,
      },
    },
    frames,
  };

  writeFileSync(outputPath, JSON.stringify(animation));

  const sizeBytes = statSync(outputPath).size;
  const sizeMB = (sizeBytes / 1024 / 1024).toFixed(1);

  return { rows, cols, sizeMB };
}
