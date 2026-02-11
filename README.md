# rune

Rune is an open-source React component library and CLI for creating mesmerizing ASCII art animations for your site

## Adding an ASCII animation to the site

### 1. Generate frames from a video

```bash
bash ascii.sh path/to/video.mp4
```

This creates `ascii_<video-name>/frame_images/` with numbered `.txt` frame files.

### 2. Move frames into `public/`

```bash
mv ascii_<video-name>/frame_images public/frames-<name>
rm -rf ascii_<video-name>
```

### 3. Add the component to a page

```tsx
<ASCIIAnimation fps={30} frameCount={43} frameFolder="frames-<name>" />
```

Set `frameCount` to the number of `.txt` files generated and `frameFolder` to the folder name you chose in `public/`.
