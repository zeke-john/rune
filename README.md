# Rune

Composable ASCII art animations for React. Drop in ASCII art animations the same way you'd use an icon pack.

Rune takes video files and converts them into grids of ASCII characters (frame by frame) so they can play as text-based animations in the browser. Each pixel's brightness is mapped to a character (dark pixels become dense characters like `@`, bright pixels become light ones like `.`) and each character can retain its original color. The result is a looping, purely text-rendered ASCII animation that you can adjust to any level of granularity.

## Quick start

```bash
npm install rune-ascii
```

```tsx
import { Rune } from "rune-ascii";

<Rune name="ghost" />;
```

That's it. The component fetches the animation data from a CDN and plays it automatically.

## How it works

There are two sides to Rune: **creating** animations and **playing** them.

### Creating an animation

You start with a short video clip (a 3D render, screen recording, whatever) and run it through the CLI:

```bash
npx @rune-ascii/cli generate ./video.mp4 --name "my-animation"
```

Under the hood, this pipeline runs:

```
Video file (.mp4, .mov, .mkv, .avi, .webm)
  → ffmpeg extracts each frame as a PNG
  → ImageMagick squishes frames vertically (text chars are taller than wide)
  → ImageMagick dumps every pixel's RGB values
  → Each pixel's luminance is mapped to an ASCII character
  → All frames are bundled into a single .rune.json file
```

The character mapping uses a ramp like `" .~-_=+*%#0oOxX@$"`, and spaces for the brightest areas, dense characters for the darkest. A font ratio (0.44) compensates for the fact that monospace characters are roughly twice as tall as they are wide.

**Requirements:** ffmpeg and ImageMagick must be installed on your system. The CLI checks for them on startup and tells you how to install them if they're missing.

### Playing an animation

The `<Rune>` React component handles everything:

1. Fetches the `.rune.json` file (from CDN, a custom URL, or passed directly as data)
2. Parses the frame data
3. Uses `requestAnimationFrame` to cycle through frames at the specified FPS
4. For colored animations, renders `<span>` elements with inline color styles
5. For plain animations, sets text content directly

The component is performance-conscious:

- **Lazy loading**: only fetches animation data when the element is near the viewport (IntersectionObserver)
- **Auto pause**: stops playing when scrolled out of view or when the browser tab loses focus
- **Reduced motion**: respects `prefers-reduced-motion`
- **Incremental updates**: reuses DOM nodes and only updates characters that changed between frames
- **Zero dependencies**: no Tailwind, no CSS files, just inline styles

## Component API

```tsx
import { Rune } from "rune-ascii";

// Built-in animation from CDN
<Rune name="ghost" />

// Smaller size variant (45 columns instead of 90)
<Rune name="ghost" size="s" />

// Control playback
<Rune name="fire" playing={false} />
<Rune name="fire" fps={15} loop={false} />

// Apply a color tint
<Rune name="fire" colorOverlay="linear-gradient(90deg, rgba(247,70,5,0.6), rgba(255,140,0,1))" />

// Load from a custom URL
<Rune src="/my-animations/custom.rune.json" />

// Pass animation data directly
<Rune data={myAnimationData} />
```

### Props

| Prop           | Type                      | Default   | Description                              |
| -------------- | ------------------------- | --------- | ---------------------------------------- |
| `name`         | `string`                  | —         | Animation name, fetches from CDN         |
| `size`         | `"s" \| "m"`              | `"m"`     | Size variant (45 or 90 columns)          |
| `data`         | `RuneAnimation`           | —         | Pass animation data directly             |
| `src`          | `string`                  | —         | URL to fetch animation data from         |
| `playing`      | `boolean`                 | `true`    | Play/pause control                       |
| `loop`         | `boolean`                 | `true`    | Loop the animation                       |
| `fps`          | `number`                  | from data | Override playback speed                  |
| `colorOverlay` | `string`                  | —         | CSS gradient to tint the animation       |
| `className`    | `string`                  | —         | Class on the container element           |
| `style`        | `CSSProperties`           | —         | Inline styles on the container           |
| `onFrame`      | `(index: number) => void` | —         | Called on each frame change              |
| `onComplete`   | `() => void`              | —         | Called when a non-looping animation ends |

### Custom CDN / self-hosting

By default, animations are fetched from jsDelivr. You can point to your own host:

```tsx
import { setRuneCdn } from "rune-ascii";

setRuneCdn("https://my-cdn.com/animations");
// Now <Rune name="ghost" /> fetches from https://my-cdn.com/animations/ghost.rune.json
```

Or use the `src` prop per-component to fetch from any URL.

## CLI

Generate your own animations from any video file.

```bash
npx @rune-ascii/cli generate ./video.mp4
```

### Options

| Flag               | Default               | Description                    |
| ------------------ | --------------------- | ------------------------------ |
| `--name`           | filename              | Animation name                 |
| `--fps`            | `30`                  | Frames per second              |
| `--columns`        | `90`                  | Width in characters            |
| `--threshold-low`  | `5`                   | Luminance floor (0–255)        |
| `--threshold-high` | `235`                 | Luminance ceiling (0–255)      |
| `--chars`          | `" .~-_=+*%#0oOxX@$"` | Character ramp (light to dark) |
| `--font-ratio`     | `0.44`                | Character aspect ratio         |
| `--no-colored`     | —                     | Disable per-character color    |
| `--output`         | current dir           | Output directory               |

### Full example

```bash
npx @rune-ascii/cli generate ./wave.mov \
  --name wave \
  --fps 30 \
  --columns 100 \
  --colored \
  --output ./public/animations
```

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

Each frame is an array of rows. Each row is a tuple, so the ASCII text string and an array of hex color codes (1 per char, empty string for default color). The `meta.generatedWith` block records the exact settings used, so you can reproduce or tweak the conversion.

## Built-in animations

These ship with `@rune-ascii/animations` and are available via CDN out of the box:

| Animation       | Description          |
| --------------- | -------------------- |
| `fire`          | Flickering fire      |
| `flame`         | Single flame         |
| `ghost`         | Floating ghost       |
| `earth1`        | Spinning globe       |
| `earth2`        | Spinning globe (alt) |
| `saturn`        | Saturn with rings    |
| `coin`          | Spinning coin        |
| `orangutan`     | Orangutan            |
| `gorilla`       | Gorilla              |
| `shoes`         | Shoes                |
| `tuxLaptop`     | Tux on a laptop      |
| `rocket`        | Rocket launch        |
| `flowerSpinner` | Spinning flower      |
| `loaderGood`    | Loading spinner      |
| `successCheck1` | Success checkmark    |
| `error`         | Error indicator      |
| `warning`       | Warning indicator    |
| `sleepEmoji`    | Sleep emoji          |
| `angryEmoji`    | Angry emoji          |
| `geekedEmoji`   | Geeked emoji         |

Each animation is available in two sizes: `"m"` (90 columns, default) and `"s"` (45 columns).

## Project structure

Rune is a monorepo with three packages:

```
rune/
  packages/
    runeAscii/          → npm: rune-ascii
    createRune/         → npm: @rune-ascii/cli
    runeAnimations/     → npm: @rune-ascii/animations
  site/                 → Next showcase site
  ascii.sh              → MP4 to ASCII script
```

### `rune-ascii`

The React component library (~20 KB) contains:

- **`Rune.tsx`**: The `<Rune>` component. Handles fetching, lazy loading, visibility-based play/pause, reduced motion, and renderer lifecycle.
- **`renderer.ts`**: `RuneRenderer` class. The animation engine using `requestAnimationFrame`. Handles frame timing, plain vs colored rendering, frame skipping, and incremental DOM updates.
- **`parser.ts`**: Converts raw `.rune.json` frame data into renderable strings (plain text) or HTML (colored `<span>` elements).
- **`cdn.ts`**: Builds CDN URLs. Defaults to jsDelivr, configurable via `setRuneCdn()`.
- **`types.ts`**: TypeScript types: `RuneAnimation`, `RuneFrame`, `RuneMeta`, `RuneProps`, etc.

### `@rune-ascii/cli`

Node.js CLI that converts video files to `.rune.json`. Shells out to `ffmpeg` (frame extraction) and `ImageMagick` (pixel analysis), then does luminance-to-character mapping in TypeScript.

### `@rune-ascii/animations`

Pre-generated `.rune.json` files published to npm. Users never install this directly it exists so that jsDelivr CDN mirrors it automatically, and the `<Rune>` component can fetch individual animations on demand without bundling them all.

## How the CDN architecture works

The `rune-ascii` package you install is tiny (~20 KB) because it contains zero animation data. Animation files live in the separate `@rune-ascii/animations` npm package, which jsDelivr mirrors automatically. When you render `<Rune name="ghost" />`, the component constructs a URL like:

```
https://cdn.jsdelivr.net/npm/@rune-ascii/animations@0.1.2/ghost.rune.json
```

…and fetches just that one animation. The browser caches it. You only download the animations you actually use.

## License

MIT
