import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

async function commandExists(cmd: string): Promise<boolean> {
  try {
    await exec("which", [cmd]);
    return true;
  } catch {
    return false;
  }
}

export async function checkDeps() {
  const ffmpeg = await commandExists("ffmpeg");
  const magick = await commandExists("magick");

  if (ffmpeg && magick) {
    console.log("Checking dependencies... ffmpeg found, magick found");
    return;
  }

  if (!ffmpeg) {
    console.error("Error: ffmpeg is not installed.");
    console.error("  macOS:   brew install ffmpeg");
    console.error("  Ubuntu:  sudo apt install ffmpeg");
    console.error("  Windows: https://ffmpeg.org/download.html");
  }

  if (!magick) {
    console.error("Error: ImageMagick is not installed.");
    console.error("  macOS:   brew install imagemagick");
    console.error("  Ubuntu:  sudo apt install imagemagick");
    console.error("  Windows: https://imagemagick.org/script/download.php");
  }

  process.exit(1);
}
