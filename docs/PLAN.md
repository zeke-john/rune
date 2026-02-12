# Rune - Build Plan

Rune is an open-source React component library and CLI for creating ASCII art animations.
It treats ASCII characters as visual primitives, letting you drop in theme-aware text animations the same way you'd use an icon pack.

---

## Current State

### What exists today

- **`ascii.sh`** - Bash script that converts video files to ASCII frames using ffmpeg + ImageMagick
- **`ASCIIAnimation`** - React component that plays back ASCII frame sequences using requestAnimationFrame
- **17 pre-generated animations** - fire, earth, saturn, loader, success, error, coin, etc. stored as individual frame files in `public/`
- **Two frame formats** - plain `.txt` (grayscale) and `.json` (per-character RGB color)
- **Demo app** - Next.js app that displays all animations in a scrollable gallery

### What's wrong with the current state

- Everything is inside a Next.js app, not a distributable package
- Each animation is 30-300 separate files (one per frame), meaning 30-300 HTTP requests per animation
- The React component depends on Tailwind and Next.js conventions (relative fetch from `/public`)
- The CLI is a bash script requiring ffmpeg + ImageMagick, not installable via npm
- No theme support, no composable API, no TypeScript exports
- No way to import an animation as a module

---

## Architecture

### Package structure (target)

```
rune/
  packages/
    rune-ascii/                # The npm package
      src/
        components/
          rune.tsx             # Core animation player component
          rune-frame.tsx       # Styled container wrapper
        core/
          renderer.ts          # Frame rendering logic (canvas-based)
          parser.ts            # Parse .rune.json format
          types.ts             # Shared TypeScript types
        animations/
          index.ts             # Re-exports all bundled animations
          earth.rune.json      # Single-file bundled animation
          loader.rune.json
          ...
        index.ts               # Package entry point
      package.json
      tsconfig.json
      tsup.config.ts           # Build config
    create-rune/               # The CLI tool
      src/
        cli.ts                 # Entry point, arg parsing
        convert.ts             # Video-to-ASCII conversion logic (port of ascii.sh)
        formats.ts             # Output format handling
      package.json
  site/                        # Docs/showcase (current cuh/ app, cleaned up)
  package.json                 # Workspace root
```

### The .rune.json format (single file per animation)

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
      "rows": [
        ["  @@XXxooo000oOxX@@  ", ["", "", "f9f276", "f8ee6c", ...]],
        ...
      ]
    },
    ...
  ]
}
```

All frames in one file. One fetch per animation. The `meta.generatedWith` block records what settings were used so users can reproduce or tweak.

### Component API (target)

```tsx
// Import a bundled animation
import { Rune } from "rune-ascii";
import earth from "rune-ascii/animations/earth";

<Rune data={earth} />
<Rune data={earth} theme="light" />
<Rune data={earth} playing={false} />
<Rune data={earth} fps={15} />

// Load from URL (CDN or self-hosted)
<Rune src="/animations/earth.rune.json" />

// User-generated animation
import myAnimation from "./my-animation.rune.json";
<Rune data={myAnimation} />
```

### Props

| Prop           | Type                          | Default   | Description                                    |
| -------------- | ----------------------------- | --------- | ---------------------------------------------- |
| `data`         | `RuneAnimation`               | -         | Animation data (imported or inline)            |
| `src`          | `string`                      | -         | URL to fetch animation data from               |
| `theme`        | `"light" \| "dark" \| "auto"` | `"auto"`  | Color scheme, auto uses prefers-color-scheme   |
| `playing`      | `boolean`                     | `true`    | Play/pause control                             |
| `loop`         | `boolean`                     | `true`    | Whether to loop the animation                  |
| `fps`          | `number`                      | from data | Override the playback speed                    |
| `colorOverlay` | `string`                      | -         | CSS gradient to tint the animation             |
| `className`    | `string`                      | -         | Custom class on the container                  |
| `style`        | `CSSProperties`               | -         | Custom styles on the container                 |
| `onFrame`      | `(index: number) => void`     | -         | Callback on each frame change                  |
| `onComplete`   | `() => void`                  | -         | Callback when animation finishes (non-looping) |

### CLI (target)

```bash
# Install
npm install -g create-rune

# Generate from video
npx create-rune generate ./video.mp4

# With all options
npx create-rune generate ./video.mp4 \
  --fps 30 \
  --columns 90 \
  --threshold-low 5 \
  --threshold-high 235 \
  --chars " .~-_=+*%#0oOxX@$" \
  --font-ratio 0.44 \
  --colored \
  --name "my-animation" \
  --output ./my-animation.rune.json

# Generate multiple sizes at once
npx create-rune generate ./video.mp4 --sizes 45,90,180
```

System requirement: ffmpeg and ImageMagick must be installed. The CLI validates this on startup and gives install instructions if missing.

---

## Phases

### Phase 1: Foundation

The .rune.json format and new package structure. Nothing ships until this is solid.

- [ ] Design and finalize the .rune.json schema
- [ ] Set up monorepo workspace (root package.json with workspaces)
- [ ] Create `packages/rune-ascii/` with package.json, tsconfig, build config
- [ ] Create `packages/create-rune/` with package.json, tsconfig, build config
- [ ] Move `cuh/` to `site/` as the docs/showcase app
- [ ] Define TypeScript types: `RuneAnimation`, `RuneFrame`, `RuneMeta`, `RuneProps`

### Phase 2: Core renderer

The rendering engine extracted from the current component, improved for performance.

- [ ] Build `parser.ts` that reads .rune.json and prepares frame data for rendering
- [ ] Build `renderer.ts` using canvas-based rendering (fillText per character with fillStyle per color)
- [ ] Support plain text mode (monochrome) falling back to textContent on a pre element
- [ ] Support colored mode via canvas
- [ ] Benchmark: target 60fps playback with a 90-column, 40-row, 30fps animation on mid-range hardware

### Phase 3: React component

Wrap the renderer in a clean React component.

- [ ] Build `<Rune>` component that accepts `data` or `src` props
- [ ] Implement lazy loading (IntersectionObserver, only fetch/parse when near viewport)
- [ ] Implement visibility-based play/pause
- [ ] Implement reduced motion support
- [ ] Implement theme prop (auto detects prefers-color-scheme, or manual light/dark)
- [ ] Implement colorOverlay via canvas compositing or CSS mix-blend-mode
- [ ] Implement playing, loop, fps, onFrame, onComplete props
- [ ] Style with inline styles only, zero external CSS or Tailwind dependency
- [ ] Build `<RuneFrame>` wrapper component (monospace container with optional dark background and padding)
- [ ] Export all types and components from package entry point

### Phase 4: CLI tool

Port ascii.sh to a Node.js CLI.

- [ ] Set up CLI entry point with arg parsing (use `commander` or `citty`)
- [ ] Check for ffmpeg/ImageMagick on startup, give install instructions if missing
- [ ] Port frame extraction: call ffmpeg via child_process to extract PNGs at target fps and columns
- [ ] Port vertical squish: call ImageMagick to resize by font ratio
- [ ] Port pixel dump: call ImageMagick to export pixel data as text
- [ ] Port luminance mapping: rewrite awk logic in TypeScript
  - Luminance calculation from RGB
  - Background detection (light/dark)
  - Threshold filtering
  - Character ramp mapping
  - Per-character hex color extraction
- [ ] Output the .rune.json single-file format
- [ ] Add progress bar (use `cli-progress` or similar)
- [ ] Expose all flags: --fps, --columns, --threshold-low, --threshold-high, --chars, --font-ratio, --colored, --name, --output
- [ ] Add --sizes flag to generate multiple column widths in one pass
- [ ] Clean up temp files after conversion
- [ ] Add validation and clear error messages

### Phase 5: Bundle existing animations

Convert the 17 existing animations into .rune.json files and make them importable.

- [ ] Write a migration script that reads the existing frame_XXXX.json/txt files and combines them into .rune.json
- [ ] Convert all 17 animations
- [ ] Set up `packages/rune-ascii/src/animations/` with one .rune.json per animation
- [ ] Create an index that re-exports each animation for tree-shaking
- [ ] Consider generating S/M/L size variants for each
- [ ] Verify each animation plays correctly with the new component

### Phase 6: Build and publish

Make the package installable from npm.

- [ ] Configure tsup/rollup to output ESM + CJS
- [ ] Set up package.json exports map (main entry, animations subpath)
- [ ] Set `peerDependencies` for react and react-dom
- [ ] Set `files` field to control what gets published (no test files, no source maps in prod)
- [ ] Reserve package name on npm (`rune-ascii` and `create-rune`)
- [ ] Add LICENSE to each package
- [ ] Publish v0.1.0

### Phase 7: Docs and showcase site

Polish the existing demo app into a proper docs site.

- [ ] Clean up `site/` (remove unrelated components like boxes.tsx, glow.tsx)
- [ ] Build an installation/quickstart page
- [ ] Build an API reference page
- [ ] Build a CLI usage guide page
- [ ] Build an animation gallery page with all bundled animations
- [ ] Build a "create your own" tutorial page
- [ ] Deploy the site (Vercel or similar)

### Phase 8: Polish (post-launch)

- [ ] Add OffscreenCanvas + Web Worker rendering option for zero main-thread impact
- [ ] Add procedural animation components (Wave, Pulse, Spinner) that generate ASCII at runtime
- [ ] Add composable primitives API (`<Frame>`, `<Overlay>`)
- [ ] Add animation composition (layer multiple animations)
- [ ] Explore frame data compression (run-length encoding, delta encoding between frames)
- [ ] Add a web-based generator (upload video in browser, convert via ffmpeg.wasm, preview, download .rune.json)

---

## Next Step

**Phase 1: Foundation.** Set up the monorepo, define the .rune.json format in TypeScript types, and create the package scaffolding. Everything else builds on top of this.
