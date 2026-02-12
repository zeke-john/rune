import type { RuneAnimation, RuneColoredFrame, RunePlainFrame } from "./types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildColoredHtml(frame: RuneColoredFrame): string {
  const lines: string[] = [];
  for (const [text, colors] of frame) {
    let html = "";
    let i = 0;
    while (i < text.length) {
      const color = colors[i] || "";
      let j = i + 1;
      while (j < text.length && (colors[j] || "") === color) j++;
      const chunk = escapeHtml(text.slice(i, j));
      html += color ? `<span style="color:#${color}">${chunk}</span>` : chunk;
      i = j;
    }
    lines.push(html);
  }
  return lines.join("\n");
}

function buildPlainText(frame: RunePlainFrame): string {
  return frame.join("\n");
}

export function parseFrames(animation: RuneAnimation): string[] {
  if (animation.meta.colored) {
    return animation.frames.map((f) => buildColoredHtml(f as RuneColoredFrame));
  }
  return animation.frames.map((f) => buildPlainText(f as RunePlainFrame));
}
