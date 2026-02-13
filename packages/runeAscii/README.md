# rune-ascii

[![npm downloads](https://img.shields.io/npm/dt/rune-ascii?style=for-the-badge&logo=npm&logoColor=white&label=downloads&color=cb3837)](https://www.npmjs.com/package/rune-ascii)

Composable ASCII art animations for React. Drop in ASCII art animations the same way you'd use an icon pack.

Rune takes video files and converts them into grids of ASCII characters (frame by frame) so they can play as text-based animations in the browser. Each pixel's brightness is mapped to a character (dark pixels become dense characters like `@`, bright pixels become light ones like `.`) and each character can retain its original color. The result is a looping, purely text-rendered ASCII animation that you can adjust to **any** level of granularity.

## Installation

```bash
npm install rune-ascii
```

Requires React 18 or later as a peer dependency.

## Quick start

```tsx
import { Rune } from "rune-ascii";

<Rune name="ghost" />;
```

That's it. The component fetches the animation data from a CDN and plays it automatically.

## Usage

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

## Props

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

## Custom CDN / self-hosting

By default, animations are fetched from jsDelivr. You can point to your own host:

```tsx
import { setRuneCdn } from "rune-ascii";

setRuneCdn("https://my-cdn.com/animations");
// Now <Rune name="ghost" /> fetches from https://my-cdn.com/animations/ghost.rune.json
```

Or use the `src` prop per-component to fetch from any URL.

## Performance

The component is performance conscious out of the box:

- **Lazy loading**: only fetches animation data when the element is near the viewport (IntersectionObserver)
- **Auto pause**: stops playing when scrolled out of view or when the browser tab loses focus
- **Reduced motion**: respects `prefers-reduced-motion`
- **Incremental updates**: reuses DOM nodes and only updates characters that changed between frames
- **Zero dependencies**: no Tailwind, no CSS files, just inline styles

## Built-in animations

These are available via CDN out of the box when using the `name` prop:

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

## Creating custom animations

Use the companion CLI to generate your own animations from any video file:

```bash
npx @rune-ascii/cli generate ./video.mp4 --name "my-animation"
```

See [@rune-ascii/cli](https://www.npmjs.com/package/@rune-ascii/cli) for full documentation.

## Related packages

- [`@rune-ascii/cli`](https://www.npmjs.com/package/@rune-ascii/cli) — CLI for generating `.rune.json` animations from video files
- [`@rune-ascii/animations`](https://www.npmjs.com/package/@rune-ascii/animations) — Pre-generated animation data served via CDN

## License

MIT
