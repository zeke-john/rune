export interface RendererOptions {
  fps: number;
  loop: boolean;
  colored: boolean;
  onFrame?: (index: number) => void;
  onComplete?: () => void;
}

export class RuneRenderer {
  private frames: string[] = [];
  private frameIndex = 0;
  private animationId: number | null = null;
  private lastFrameTime = -1;
  private element: HTMLElement | null = null;
  private options: RendererOptions;

  constructor(options: RendererOptions) {
    this.options = options;
  }

  setFrames(frames: string[]) {
    this.frames = frames;
    this.frameIndex = 0;
  }

  attach(element: HTMLElement) {
    this.element = element;
  }

  detach() {
    this.stop();
    this.element = null;
  }

  renderCurrentFrame() {
    if (!this.element || this.frames.length === 0) return;
    const frame = this.frames[this.frameIndex];
    if (this.options.colored) {
      this.element.innerHTML = frame;
    } else {
      this.element.textContent = frame;
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

  private tick = (time: number) => {
    const frameTime = 1000 / this.options.fps;

    if (this.lastFrameTime === -1) {
      this.lastFrameTime = time;
    } else {
      let delta = time - this.lastFrameTime;
      while (delta >= frameTime) {
        if (this.frames.length > 0) {
          const nextIndex = this.frameIndex + 1;
          if (nextIndex >= this.frames.length && !this.options.loop) {
            this.renderCurrentFrame();
            this.options.onComplete?.();
            this.animationId = null;
            return;
          }
          this.frameIndex = nextIndex % this.frames.length;
          this.renderCurrentFrame();
          this.options.onFrame?.(this.frameIndex);
        }
        delta -= frameTime;
        this.lastFrameTime += frameTime;
      }
    }

    this.animationId = requestAnimationFrame(this.tick);
  };
}
