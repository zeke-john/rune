import { useCallback, useRef, useState, type CSSProperties } from "react";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { parseFrames } from "../core/parser";
import { RuneRenderer } from "../core/renderer";
import { getAnimationUrl, type RuneSize } from "../core/cdn";
import type { RuneAnimation } from "../core/types";

export interface RuneProps {
  name?: string;
  size?: RuneSize;
  data?: RuneAnimation;
  src?: string;
  fps?: number;
  playing?: boolean;
  loop?: boolean;
  colorOverlay?: string;
  className?: string;
  style?: CSSProperties;
  onFrame?: (index: number) => void;
  onComplete?: () => void;
}

const containerStyle: CSSProperties = {
  position: "relative",
  fontFamily: "monospace",
  whiteSpace: "pre",
  overflow: "hidden",
  fontSize: "10px",
  lineHeight: 1,
};

const overlayStyle = (colorOverlay: string): CSSProperties => ({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  borderRadius: "12px",
  background: colorOverlay,
  mixBlendMode: "color",
});

export function Rune({
  name,
  size = "m",
  data,
  src,
  fps,
  playing = true,
  loop = true,
  colorOverlay,
  className,
  style,
  onFrame,
  onComplete,
}: RuneProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const displayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<RuneRenderer | null>(null);
  const animationDataRef = useRef<RuneAnimation | null>(null);
  const hasLoadedRef = useRef(false);

  const initRenderer = useCallback(
    (animData: RuneAnimation) => {
      animationDataRef.current = animData;
      const effectiveFps = fps ?? animData.meta.fps;
      const frames = parseFrames(animData);

      const renderer = new RuneRenderer({
        fps: effectiveFps,
        loop,
        colored: animData.meta.colored,
        onFrame,
        onComplete,
      });
      renderer.setFrames(frames);
      rendererRef.current = renderer;

      if (displayRef.current) {
        renderer.attach(displayRef.current);
        renderer.renderCurrentFrame();
      }

      setStatus("ready");
    },
    [fps, loop, onFrame, onComplete],
  );

  const resolveUrl = useCallback((): string | null => {
    if (src) return src;
    if (name) return getAnimationUrl(name, size);
    return null;
  }, [src, name, size]);

  const load = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    if (data) {
      initRenderer(data);
      return;
    }

    const url = resolveUrl();
    if (url) {
      setStatus("loading");
      const response = await fetch(url);
      const animData: RuneAnimation = await response.json();
      initRenderer(animData);
    }
  }, [data, resolveUrl, initRenderer]);

  useIntersectionObserver(containerRef, load, { rootMargin: "400px" });

  useIsomorphicLayoutEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || status !== "ready") return;

    if (displayRef.current) {
      renderer.attach(displayRef.current);
      renderer.renderCurrentFrame();
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    let isVisible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (entry.isIntersecting && playing && document.hasFocus()) {
          renderer.start();
        } else {
          renderer.stop();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    const handleFocus = () => {
      if (isVisible && playing) renderer.start();
    };
    const handleBlur = () => renderer.stop();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      observer.disconnect();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      renderer.stop();
    };
  }, [status, playing]);

  useIsomorphicLayoutEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.updateOptions({
      fps: fps ?? animationDataRef.current?.meta.fps ?? 30,
      loop,
      onFrame,
      onComplete,
    });
  }, [fps, loop, onFrame, onComplete]);

  useIsomorphicLayoutEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || status !== "ready") return;
    if (playing) {
      renderer.start();
    } else {
      renderer.stop();
    }
  }, [playing, status]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ ...containerStyle, ...style }}
    >
      {status !== "ready" && status === "loading" && (
        <div style={{ color: "#666" }}>Loading...</div>
      )}
      <div style={{ position: "relative" }}>
        <div ref={displayRef} />
        {colorOverlay && <div style={overlayStyle(colorOverlay)} />}
      </div>
    </div>
  );
}
