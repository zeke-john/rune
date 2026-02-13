# @rune-ascii/cli

CLI for generating ASCII art animations from video files. Converts any video into a `.rune.json` file that can be played with the [`rune-ascii`](https://www.npmjs.com/package/rune-ascii) React component.

## Installation

You can run it directly with npx (no install needed):

```bash
npx @rune-ascii/cli generate ./video.mp4
```

Or install it globally:

```bash
npm install -g @rune-ascii/cli
```

## Requirements

The CLI requires two system dependencies:

- **ffmpeg** — for extracting video frames
- **ImageMagick** — for pixel analysis

The CLI checks for them on startup and tells you how to install them if they're missing.

### macOS

```bash
brew install ffmpeg imagemagick
```

### Ubuntu / Debian

```bash
sudo apt install ffmpeg imagemagick
```

## Usage

```bash
npx @rune-ascii/cli generate <video-file> [options]
```

### Options

| Flag               | Default                | Description                    |
| ------------------ | ---------------------- | ------------------------------ |
| `--name`           | filename               | Animation name                 |
| `--fps`            | `30`                   | Frames per second              |
| `--columns`        | `90`                   | Width in characters            |
| `--threshold-low`  | `5`                    | Luminance floor (0–255)        |
| `--threshold-high` | `235`                  | Luminance ceiling (0–255)      |
| `--chars`          | `" .~-_=+*%#0oOxX@$"` | Character ramp (light to dark) |
| `--font-ratio`     | `0.44`                 | Character aspect ratio         |
| `--no-colored`     | —                      | Disable per-character color    |
| `--output`         | current dir            | Output directory               |

### Example

```bash
npx @rune-ascii/cli generate ./wave.mov \
  --name wave \
  --fps 30 \
  --columns 120 \
  --colored \
  --output ./public/animations
```

## How it works

```
Video file (.mp4, .mov, .mkv, .avi, .webm)
  → ffmpeg extracts each frame as a PNG
  → ImageMagick squishes frames vertically (text chars are taller than wide)
  → ImageMagick dumps every pixel's RGB values
  → Each pixel's luminance is mapped to an ASCII character
  → All frames are bundled into a single .rune.json file
```

The character mapping uses a ramp like `" .~-_=+*%#0oOxX@$"` — spaces for the brightest areas, dense characters for the darkest. A font ratio (0.44) compensates for the fact that monospace characters are roughly twice as tall as they are wide.

## The `.rune.json` format

Every animation is a single JSON file containing all frames:

```json
{
  "version": 1,
  "meta": {
    "name": "earth",
    "fps": 30,
    "columns": 90,
    "rows": 40,
    "frameCount": 154,
    "colored": true,
    "generatedWith": {
      "thresholdLow": 5,
      "thresholdHigh": 235,
      "chars": " .~-_=+*%#0oOxX@$",
      "fontRatio": 0.44
    }
  },
  "frames": [
    {
      "rows": [["  @@XXxooo000oOxX@@  ", ["", "", "f9f276", "f8ee6c", "..."]]]
    }
  ]
}
```

Each frame is an array of rows. Each row is a tuple: the ASCII text string and an array of hex color codes (1 per character, empty string for default color).

## Related packages

- [`rune-ascii`](https://www.npmjs.com/package/rune-ascii) — React component for playing ASCII animations
- [`@rune-ascii/animations`](https://www.npmjs.com/package/@rune-ascii/animations) — Pre-generated animation data served via CDN

## License

MIT
