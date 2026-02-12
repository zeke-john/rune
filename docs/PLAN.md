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

### Package structure

```
rune/
  packages/
    runeAscii/                   # npm package: rune-ascii (~20 KB installed)
      src/
        components/
          Rune.tsx               # Core animation player component
        core/
          cdn.ts                 # CDN URL builder (jsdelivr)
          renderer.ts            # rAF-based frame playback engine
          parser.ts              # Parse .rune.json into renderable strings
          types.ts               # Shared TypeScript types
        hooks/
          useIsomorphicLayoutEffect.ts
          useIntersectionObserver.ts
        index.ts                 # Package entry point
      package.json
      tsconfig.json
      tsup.config.ts
    runeAnimations/              # npm package: @rune-ascii/animations (CDN-only, users never install)
      ghost.rune.json            # M size (90 columns)
      ghost.s.rune.json          # S size (45 columns)
      earthNight.rune.json
      ...                        # 36 files (18 animations x 2 sizes)
      package.json
    createRune/                  # npm package: create-rune (CLI tool)
      src/
        index.ts                 # Placeholder
      package.json
  site/                          # Docs/showcase site
  ascii.sh                       # Reference implementation for CLI
  package.json                   # Workspace root
```

### CDN architecture

Animation data is NOT bundled in the main `rune-ascii` package. Instead:

1. `rune-ascii` (what users install) is ~20 KB -- just the component, renderer, parser, and types
2. `@rune-ascii/animations` is published to npm but users never install it
3. jsdelivr CDN automatically mirrors npm packages, so animations are served from:
   `https://cdn.jsdelivr.net/npm/@rune-ascii/animations@0.1.0/ghost.rune.json`
4. The `<Rune name="ghost" />` component constructs this URL and fetches on demand
5. Users only download the specific animations they render, cached by the browser

This scales to 150+ animations without increasing the install size of `rune-ascii`.

For custom CDN or self-hosting, use `setRuneCdn("/your/path")` or the `src` prop.

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

### Component API

```tsx
import { Rune } from "rune-ascii";

// Fetch from CDN by name (recommended)
<Rune name="ghost" />
<Rune name="earthNight" size="s" />
<Rune name="ghost" playing={false} />
<Rune name="ghost" fps={15} />

// Fetch from custom URL
<Rune src="/my-animations/custom.rune.json" />

// Pass data directly (for self-hosted or user-generated)
<Rune data={myAnimationData} />

// Configure CDN base URL (for self-hosting)
import { setRuneCdn } from "rune-ascii";
setRuneCdn("https://my-cdn.com/animations");
```

### Props

| Prop           | Type                      | Default   | Description                                    |
| -------------- | ------------------------- | --------- | ---------------------------------------------- |
| `name`         | `string`                  | -         | Animation name, fetches from CDN               |
| `size`         | `"s" \| "m"`              | `"m"`     | Size variant (45 or 90 columns)                |
| `data`         | `RuneAnimation`           | -         | Animation data (passed directly)               |
| `src`          | `string`                  | -         | URL to fetch animation data from               |
| `playing`      | `boolean`                 | `true`    | Play/pause control                             |
| `loop`         | `boolean`                 | `true`    | Whether to loop the animation                  |
| `fps`          | `number`                  | from data | Override the playback speed                    |
| `colorOverlay` | `string`                  | -         | CSS gradient to tint the animation             |
| `className`    | `string`                  | -         | Custom class on the container                  |
| `style`        | `CSSProperties`           | -         | Custom styles on the container                 |
| `onFrame`      | `(index: number) => void` | -         | Callback on each frame change                  |
| `onComplete`   | `() => void`              | -         | Callback when animation finishes (non-looping) |

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

### Phase 1: Foundation (DONE)

The .rune.json format and new package structure.

- [x] Design and finalize the .rune.json schema
- [x] Set up monorepo workspace (root package.json with workspaces)
- [x] Create `packages/runeAscii/` with package.json, tsconfig, build config
- [x] Create `packages/createRune/` with package.json, tsconfig, build config
- [x] Move `cuh/` to `site/` as the docs/showcase app
- [x] Define TypeScript types: `RuneAnimation`, `RuneFrame`, `RuneMeta`, `RuneProps`

### Phase 2: Core renderer (DONE)

The rendering engine extracted from the current component.

- [x] Build `parser.ts` that reads .rune.json and prepares frame data for rendering
- [x] Build `renderer.ts` with rAF-based playback, loop/non-loop, onFrame/onComplete
- [x] Support plain text mode (monochrome) via textContent
- [x] Support colored mode via innerHTML with run-length-optimized spans

### Phase 3: React component (DONE)

Wrap the renderer in a clean React component.

- [x] Build `<Rune>` component that accepts `data` or `src` props
- [x] Implement lazy loading (IntersectionObserver, only fetch/parse when near viewport)
- [x] Implement visibility-based play/pause
- [x] Implement reduced motion support
- [x] Implement colorOverlay via CSS mix-blend-mode
- [x] Implement playing, loop, fps, onFrame, onComplete props
- [x] Style with inline styles only, zero external CSS or Tailwind dependency
- [x] Export all types and components from package entry point

### Phase 4: CLI tool (DONE)

Port ascii.sh to a Node.js CLI: `npx create-rune ./video.mp4 --name rocket`

- [x] Set up CLI entry point with commander arg parsing
- [x] Check for ffmpeg/ImageMagick on startup, give install instructions if missing
- [x] Port frame extraction: ffmpeg via child_process to extract PNGs at target fps and columns
- [x] Port vertical squish: ImageMagick resize by font ratio
- [x] Port pixel dump: ImageMagick text output parsed in TypeScript
- [x] Port luminance mapping: rewrite awk logic in TypeScript (luminance, background detection, thresholds, character ramp, hex colors)
- [x] Output the .rune.json single-file format
- [x] Progress counter during frame processing
- [x] Expose all flags: --fps, --columns, --thresholdLow, --thresholdHigh, --chars, --fontRatio, --colored, --name, --output
- [x] Clean up temp files after conversion
- [x] Auto-detect public/ folder and place output there
- [x] Print usage instructions after generation
- [x] Tested: rocket.mov converted to 61-frame .rune.json in 7 seconds, verified rendering in site

### Phase 5: Bundle existing animations (DONE)

Convert the 18 existing animations into .rune.json files and make them importable.

- [x] Write a migration script that reads the existing frame_XXXX.json/txt files and combines them into .rune.json
- [x] Convert all 18 animations
- [x] Set up `packages/runeAscii/src/animations/` with one .rune.json per animation
- [x] Verify animations play correctly with the new `<Rune>` component
- [x] Make animations importable: `import ghost from "rune-ascii/animations/ghost"` works via package.json exports + typesVersions + animations.d.ts
- [x] Generated S (45-column) size variants for all 18 animations, importable as `rune-ascii/animations/ghost.s`
- [ ] L (180-column) variants to be generated from source videos when CLI is built

### Phase 6: Build and publish

Make the package installable from npm.

- [x] Configure tsup to output ESM + CJS + .d.ts
- [x] Set up package.json exports map (main entry + animations/\* subpath wildcard)
- [x] Set `peerDependencies` for react and react-dom
- [x] Set `files` field to control what gets published
- [ ] Reserve package name on npm (`rune-ascii` and `create-rune`)
- [ ] Add LICENSE to each package
- [ ] Publish v0.1.0

### Phase 7: Docs and showcase site

Polish the existing demo app into a proper docs site.

- [x] Clean up `site/` (removed boxes, glow, glowCards, animatedText, nav, themeProvider, transitionProvider, ui/, about route, leftover SVGs, lib/utils, components.json)
- [x] Moved `ascii.sh` to repo root as CLI reference implementation
- [x] All animations use data imports, no .rune.json files in site/public/
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

**Phase 4: CLI tool.** Port `ascii.sh` to a Node.js CLI so users can generate their own animations with `npx create-rune generate ./video.mp4`.
