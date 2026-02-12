import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join, relative } from "node:path";

function detectPublicDir(): string | null {
  const cwd = process.cwd();
  const candidates = ["public", "static", "assets"];
  for (const dir of candidates) {
    if (existsSync(join(cwd, dir))) return join(cwd, dir);
  }
  return null;
}

export function resolveOutputPath(
  name: string,
  outputFlag: string | undefined,
): string {
  if (outputFlag) {
    mkdirSync(outputFlag, { recursive: true });
    return join(outputFlag, `${name}.rune.json`);
  }

  const publicDir = detectPublicDir();
  if (publicDir) {
    const animDir = join(publicDir, "animations");
    mkdirSync(animDir, { recursive: true });
    return join(animDir, `${name}.rune.json`);
  }

  return join(process.cwd(), `${name}.rune.json`);
}

export function moveToOutput(tempPath: string, finalPath: string) {
  renameSync(tempPath, finalPath);
}

export function printUsage(
  finalPath: string,
  name: string,
  frameCount: number,
  cols: number,
  rows: number,
  sizeMB: string,
) {
  const rel = relative(process.cwd(), finalPath);
  const publicMatch = rel.match(/^(?:.*?)(public[/\\])(.*)/);
  const servePath = publicMatch ? `/${publicMatch[2]}` : `/${rel}`;

  console.log("");
  console.log(`Created: ${rel} (${sizeMB} MB, ${frameCount} frames, ${cols}x${rows})`);
  console.log("");
  console.log("Use it in your app:");
  console.log("");
  console.log('  import { Rune } from "rune-ascii";');
  console.log(`  <Rune src="${servePath}" />`);
  console.log("");
}
