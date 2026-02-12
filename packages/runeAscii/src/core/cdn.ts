const DEFAULT_CDN_BASE =
  "https://cdn.jsdelivr.net/npm/@rune-ascii/animations@0.1.0";

let cdnBase = DEFAULT_CDN_BASE;

export type RuneSize = "s" | "m";

export function setRuneCdn(base: string) {
  cdnBase = base;
}

export function getAnimationUrl(name: string, size: RuneSize = "m"): string {
  const suffix = size === "s" ? ".s" : "";
  return `${cdnBase}/${name}${suffix}.rune.json`;
}
