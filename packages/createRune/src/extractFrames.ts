import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const exec = promisify(execFile);

export interface ExtractOptions {
  fps: number;
  columns: number;
  fontRatio: number;
}

export async function extractFrames(
  videoPath: string,
  tempDir: string,
  options: ExtractOptions,
): Promise<string[]> {
  const framesDir = join(tempDir, "frames");
  mkdirSync(framesDir, { recursive: true });

  console.log(
    `Extracting frames at ${options.fps}fps, ${options.columns} columns...`,
  );

  await exec("ffmpeg", [
    "-loglevel",
    "error",
    "-i",
    videoPath,
    "-vf",
    `scale=${options.columns}:-2,fps=${options.fps}`,
    join(framesDir, "frame_%04d.png"),
  ]);

  const pngFiles = readdirSync(framesDir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => join(framesDir, f));

  console.log(`Extracted ${pngFiles.length} frames`);
  return pngFiles;
}

export async function getPixelData(
  framePath: string,
  fontRatio: number,
): Promise<string> {
  const { stdout: heightStr } = await exec("magick", [
    "identify",
    "-ping",
    "-format",
    "%h",
    framePath,
  ]);

  const originalHeight = parseInt(heightStr.trim(), 10);
  const newHeight = Math.round(fontRatio * originalHeight);

  const squished = framePath.replace(".png", "_sq.png");
  await exec("magick", [
    framePath,
    "-resize",
    `x${newHeight}!`,
    squished,
  ]);

  const { stdout: pixelText } = await exec("magick", [squished, "txt:-"]);

  const { unlink } = await import("node:fs/promises");
  await unlink(squished);

  return pixelText;
}
