import { Command } from "commander";
import { basename, resolve } from "node:path";
import { mkdirSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkDeps } from "./checkDeps.js";
import { extractFrames, getPixelData } from "./extractFrames.js";
import { convertPixelsToAscii } from "./convertFrame.js";
import { bundleAnimation } from "./bundle.js";
import { resolveOutputPath, printUsage } from "./output.js";

const SUPPORTED_FORMATS = ["mp4", "mkv", "mov", "avi", "webm"];

const program = new Command();

program
  .name("create-rune")
  .description("Generate ASCII art animations from video files")
  .argument("<video>", "Path to the video file")
  .option("--name <name>", "Animation name (default: video filename)")
  .option("--fps <number>", "Frames per second", "30")
  .option("--columns <number>", "Width in characters", "90")
  .option("--thresholdLow <number>", "Dark background cutoff", "5")
  .option("--thresholdHigh <number>", "Light background cutoff", "235")
  .option("--chars <string>", "Character ramp", " .~-_=+*%#0oOxX@$")
  .option("--fontRatio <number>", "Character aspect ratio", "0.44")
  .option("--no-colored", "Disable per-character color")
  .option("--output <path>", "Output directory (default: auto-detect public/)")
  .action(async (videoArg: string, opts: Record<string, string | boolean>) => {
    const videoPath = resolve(videoArg);
    const ext = videoPath.split(".").pop()?.toLowerCase() ?? "";

    if (!SUPPORTED_FORMATS.includes(ext)) {
      console.error(`Error: Unsupported format ".${ext}"`);
      console.error(`Supported: ${SUPPORTED_FORMATS.join(", ")}`);
      process.exit(1);
    }

    const name =
      (opts.name as string) ??
      basename(videoPath, `.${ext}`).replace(/[^a-zA-Z0-9]/g, "");
    const fps = parseInt(opts.fps as string, 10);
    const columns = parseInt(opts.columns as string, 10);
    const thresholdLow = parseInt(opts.thresholdLow as string, 10);
    const thresholdHigh = parseInt(opts.thresholdHigh as string, 10);
    const chars = opts.chars as string;
    const fontRatio = parseFloat(opts.fontRatio as string);
    const colored = opts.colored !== false;

    await checkDeps();

    const tempDir = join(tmpdir(), `rune-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });

    const framePaths = await extractFrames(videoPath, tempDir, {
      fps,
      columns,
      fontRatio,
    });

    console.log(`Processing ${framePaths.length} frames into ASCII...`);

    const allFrames: [string, string[]][][] = [];

    for (let i = 0; i < framePaths.length; i++) {
      const pixelText = await getPixelData(framePaths[i], fontRatio);
      const asciiFrame = convertPixelsToAscii(pixelText, {
        thresholdLow,
        thresholdHigh,
        chars,
        colored,
      });
      allFrames.push(asciiFrame);

      process.stdout.write(`\r[${i + 1}/${framePaths.length}]`);
    }
    console.log(" Done");

    const tempOutput = join(tempDir, `${name}.rune.json`);
    const { rows, cols, sizeMB } = bundleAnimation(
      allFrames,
      tempOutput,
      { name, fps, columns, colored, thresholdLow, thresholdHigh, chars, fontRatio },
    );

    const finalPath = resolveOutputPath(
      name,
      opts.output as string | undefined,
    );

    const { copyFileSync } = await import("node:fs");
    copyFileSync(tempOutput, finalPath);

    rmSync(tempDir, { recursive: true, force: true });

    printUsage(finalPath, name, allFrames.length, cols, rows, sizeMB);
  });

program.parse();
