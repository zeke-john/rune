import type { ColoredRunSegment } from "./parser";

export interface RendererOptions {
  fps: number;
  loop: boolean;
  colored: boolean;
  onFrame?: (index: number) => void;
  onComplete?: () => void;
}

/**
 * Colored frame DOM structure:
 *   container > lineDiv[0] > span[0], span[1], ...
 *               lineDiv[1] > span[0], span[1], ...
 *
 * On each frame we reuse the existing spans and only update
 * textContent + style.color where they differ from the previous frame.
 * This completely avoids innerHTML parsing and DOM tree teardown/rebuild.
 */
export class RuneRenderer {
  /* Plain (non-colored) frames – simple strings */
  private plainFrames: string[] = [];
  /* Colored frames – structured segment data for incremental DOM updates */
  private coloredFrames: ColoredRunSegment[][][] = [];
  private frameIndex = 0;
  private animationId: number | null = null;
  private lastFrameTime = -1;
  private element: HTMLElement | null = null;
  private options: RendererOptions;

  /* Cached DOM nodes for colored mode */
  private lineEls: HTMLDivElement[] = [];
  private spanEls: HTMLSpanElement[][] = [];

  constructor(options: RendererOptions) {
    this.options = options;
  }

  setFrames(frames: string[]) {
    this.plainFrames = frames;
    this.coloredFrames = [];
    this.frameIndex = 0;
  }

  setPlainFrames(frames: string[]) {
    this.plainFrames = frames;
    this.coloredFrames = [];
    this.frameIndex = 0;
  }

  setColoredFrames(frames: ColoredRunSegment[][][]) {
    this.coloredFrames = frames;
    this.plainFrames = [];
    this.frameIndex = 0;
  }

  attach(element: HTMLElement) {
    this.element = element;
    /* Reset cached DOM – will be rebuilt on first render */
    this.lineEls = [];
    this.spanEls = [];
  }

  detach() {
    this.stop();
    this.element = null;
    this.lineEls = [];
    this.spanEls = [];
  }

  renderCurrentFrame() {
    if (!this.element) return;
    if (this.coloredFrames.length > 0) {
      this.renderColoredFrame();
    } else if (this.options.colored) {
      this.renderColoredPlainFrame();
    } else {
      this.renderPlainFrame();
    }
  }

  start() {
    if (this.animationId !== null) return;
    this.lastFrameTime = -1;
    this.animationId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.animationId === null) return;
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  isPlaying() {
    return this.animationId !== null;
  }

  updateOptions(partial: Partial<RendererOptions>) {
    Object.assign(this.options, partial);
  }

  /* ---- Plain (non-colored) rendering ---- */

  private renderPlainFrame() {
    if (!this.element || this.plainFrames.length === 0) return;
    this.element.textContent = this.plainFrames[this.frameIndex];
  }

  /* ---- Colored rendering via HTML strings (from parseFrames) ---- */

  private renderColoredPlainFrame() {
    if (!this.element || this.plainFrames.length === 0) return;
    this.element.innerHTML = this.plainFrames[this.frameIndex];
  }

  /* ---- Colored rendering via incremental DOM ---- */

  private renderColoredFrame() {
    if (!this.element || this.coloredFrames.length === 0) return;
    const frame = this.coloredFrames[this.frameIndex];

    /* Ensure we have enough line divs */
    while (this.lineEls.length < frame.length) {
      const div = document.createElement("div");
      this.element.appendChild(div);
      this.lineEls.push(div);
      this.spanEls.push([]);
    }
    /* Hide extra line divs if frame has fewer lines */
    for (let i = frame.length; i < this.lineEls.length; i++) {
      if (this.lineEls[i].style.display !== "none") {
        this.lineEls[i].style.display = "none";
      }
    }

    for (let row = 0; row < frame.length; row++) {
      const lineDiv = this.lineEls[row];
      if (lineDiv.style.display === "none") {
        lineDiv.style.display = "";
      }
      const segments = frame[row];
      const spans = this.spanEls[row];

      /* Ensure we have enough spans in this line */
      while (spans.length < segments.length) {
        const span = document.createElement("span");
        lineDiv.appendChild(span);
        spans.push(span);
      }
      /* Hide extra spans */
      for (let i = segments.length; i < spans.length; i++) {
        if (spans[i].style.display !== "none") {
          spans[i].style.display = "none";
        }
      }

      for (let col = 0; col < segments.length; col++) {
        const seg = segments[col];
        const span = spans[col];
        if (span.style.display === "none") {
          span.style.display = "";
        }
        /* Only touch the DOM when values actually changed */
        if (span.textContent !== seg.text) {
          span.textContent = seg.text;
        }
        const wantColor = seg.color ? `#${seg.color}` : "";
        if (span.style.color !== wantColor) {
          span.style.color = wantColor;
        }
      }
    }
  }

  /* ---- Animation loop ---- */

  private tick = (time: number) => {
    const frameTime = 1000 / this.options.fps;
    const totalFrames = this.coloredFrames.length > 0
      ? this.coloredFrames.length
      : this.plainFrames.length;

    if (this.lastFrameTime === -1) {
      this.lastFrameTime = time;
    } else {
      let delta = time - this.lastFrameTime;
      /* Advance at most one visual frame per rAF to avoid doing
         multiple expensive DOM writes in the same paint. If we fall
         behind we skip to where we should be (drop frames gracefully). */
      if (delta >= frameTime && totalFrames > 0) {
        const framesToAdvance = Math.floor(delta / frameTime);
        const nextIndex = this.frameIndex + framesToAdvance;

        if (nextIndex >= totalFrames && !this.options.loop) {
          this.frameIndex = totalFrames - 1;
          this.renderCurrentFrame();
          this.options.onComplete?.();
          this.animationId = null;
          return;
        }

        this.frameIndex = nextIndex % totalFrames;
        this.renderCurrentFrame();
        this.options.onFrame?.(this.frameIndex);
        this.lastFrameTime += framesToAdvance * frameTime;
      }
    }

    this.animationId = requestAnimationFrame(this.tick);
  };
}
