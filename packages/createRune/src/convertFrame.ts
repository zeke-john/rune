export interface ConvertOptions {
  thresholdLow: number;
  thresholdHigh: number;
  chars: string;
  colored: boolean;
}

interface Pixel {
  row: number;
  col: number;
  r: number;
  g: number;
  b: number;
}

function luminance(r: number, g: number, b: number): number {
  return Math.floor(0.2126 * r + 0.7152 * g + 0.0722 * b);
}

function parsePixelData(text: string): Pixel[] {
  const pixels: Pixel[] = [];
  const lines = text.split("\n");

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const posMatch = line.match(/^(\d+),(\d+):/);
    if (!posMatch) continue;

    const col = parseInt(posMatch[1], 10);
    const row = parseInt(posMatch[2], 10);

    const rgbMatch = line.match(/\((\d+),(\d+),(\d+)/);
    if (!rgbMatch) {
      const grayMatch = line.match(/\((\d+)\)/);
      if (grayMatch) {
        const g = parseInt(grayMatch[1], 10);
        pixels.push({ row, col, r: g, g, b: g });
      }
      continue;
    }

    pixels.push({
      row,
      col,
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    });
  }

  return pixels;
}

function detectBackground(
  pixels: Pixel[],
): "light" | "dark" {
  const sample = pixels.filter((p) => p.row === 0).slice(0, 10);
  if (sample.length === 0) return "dark";

  let total = 0;
  for (const p of sample) {
    total += luminance(p.r, p.g, p.b);
  }

  return total / sample.length > 200 ? "light" : "dark";
}

export function convertPixelsToAscii(
  pixelText: string,
  options: ConvertOptions,
): [string, string[]][] {
  const pixels = parsePixelData(pixelText);
  if (pixels.length === 0) return [];

  const bg = detectBackground(pixels);
  const { thresholdLow, thresholdHigh, chars, colored } = options;

  let contentMax = 0;
  for (const p of pixels) {
    const lum = luminance(p.r, p.g, p.b);
    const isBg =
      bg === "dark" ? lum < thresholdLow : lum > thresholdHigh;
    if (!isBg && lum > contentMax) contentMax = lum;
  }
  if (contentMax === 0) contentMax = 255;

  const lumFloor = bg === "light" ? 0 : thresholdLow;
  const lumCeil = bg === "light" ? thresholdHigh : contentMax;
  const lumRange = Math.max(lumCeil - lumFloor, 1);
  const numChars = chars.length;

  const rowMap = new Map<number, { text: string; colors: string[] }>();

  for (const p of pixels) {
    const lum = luminance(p.r, p.g, p.b);
    const isBg =
      bg === "dark" ? lum < thresholdLow : lum > thresholdHigh;

    let char: string;
    let color: string;

    if (isBg) {
      char = " ";
      color = "";
    } else {
      let idx = Math.floor(((lum - lumFloor) * (numChars - 1)) / lumRange);
      idx = Math.max(0, Math.min(numChars - 1, idx));
      char = chars[idx];
      color = colored
        ? `${p.r.toString(16).padStart(2, "0")}${p.g.toString(16).padStart(2, "0")}${p.b.toString(16).padStart(2, "0")}`
        : "";
    }

    let row = rowMap.get(p.row);
    if (!row) {
      row = { text: "", colors: [] };
      rowMap.set(p.row, row);
    }
    row.text += char;
    row.colors.push(color);
  }

  const sortedRows = [...rowMap.keys()].sort((a, b) => a - b);
  return sortedRows.map((key) => {
    const row = rowMap.get(key)!;
    return [row.text, row.colors];
  });
}
