# @rune-ascii/animations

Pre-generated ASCII art animation data for [`rune-ascii`](https://www.npmjs.com/package/rune-ascii). This package exists so that jsDelivr CDN mirrors it automatically, allowing the `<Rune>` component to fetch individual animations on demand without bundling them all.

**You don't need to install this package directly.** The `rune-ascii` React component fetches animations from this package via CDN automatically.

## How it works

When you render a component like:

```tsx
import { Rune } from "rune-ascii";

<Rune name="ghost" />;
```

The `rune-ascii` component constructs a CDN URL like:

```
https://cdn.jsdelivr.net/npm/@rune-ascii/animations@0.1.2/ghost.rune.json
```

...and fetches just that one animation. The browser caches it. You only download the animations you actually use.

## Available animations

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

## Creating your own animations

Use the companion CLI to generate custom `.rune.json` files from any video:

```bash
npx @rune-ascii/cli generate ./video.mp4 --name "my-animation"
```

See [@rune-ascii/cli](https://www.npmjs.com/package/@rune-ascii/cli) for full documentation.

## Related packages

- [`rune-ascii`](https://www.npmjs.com/package/rune-ascii) — React component for playing ASCII animations
- [`@rune-ascii/cli`](https://www.npmjs.com/package/@rune-ascii/cli) — CLI for generating `.rune.json` animations from video files

## License

MIT
