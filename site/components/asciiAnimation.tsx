"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ColoredFrameRow = [string, string[]];
type ColoredFrame = ColoredFrameRow[];

function buildColoredFrameHtml(frame: ColoredFrame): string {
  const lines: string[] = [];
  for (const [text, colors] of frame) {
    let html = "";
    let i = 0;
    while (i < text.length) {
      const color = colors[i] || "";
      let j = i + 1;
      while (j < text.length && (colors[j] || "") === color) j++;
      const chunk = text
        .slice(i, j)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      if (color) {
        html += `<span style="color:#${color}">${chunk}</span>`;
      } else {
        html += chunk;
      }
      i = j;
    }
    lines.push(html);
  }
  return lines.join("\n");
}

interface ASCIIAnimationProps {
  frames?: string[];
  className?: string;
  fps?: number;
  colorOverlay?: string;
  frameCount?: number;
  frameFolder?: string;
  colored?: boolean;
}

export default function ASCIIAnimation({
  frames: providedFrames,
  className = "",
  fps = 24,
  colorOverlay,
  frameCount = 60,
  frameFolder = "frames",
  colored = false,
}: ASCIIAnimationProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const framesRef = useRef<string[]>([]);
  const frameIndexRef = useRef(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(-1);
  const isVisibleRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const renderFrame = useCallback(() => {
    const el = displayRef.current;
    const frames = framesRef.current;
    if (!el || frames.length === 0) return;
    const idx = frameIndexRef.current;
    if (colored) {
      el.innerHTML = frames[idx];
    } else {
      el.textContent = frames[idx];
    }
  }, [colored]);

  const tick = useCallback(
    (time: number) => {
      const frameTime = 1000 / fps;
      if (lastFrameTimeRef.current === -1) {
        lastFrameTimeRef.current = time;
      } else {
        let delta = time - lastFrameTimeRef.current;
        while (delta >= frameTime) {
          const len = framesRef.current.length;
          if (len > 0) {
            frameIndexRef.current = (frameIndexRef.current + 1) % len;
            renderFrame();
          }
          delta -= frameTime;
          lastFrameTimeRef.current += frameTime;
        }
      }
      animationRef.current = requestAnimationFrame(tick);
    },
    [fps, renderFrame],
  );

  const startAnimation = useCallback(() => {
    if (animationRef.current != null) return;
    lastFrameTimeRef.current = -1;
    animationRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current == null) return;
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }, []);

  const loadFrames = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    if (providedFrames) {
      framesRef.current = providedFrames;
      setStatus("ready");
      return;
    }

    setStatus("loading");

    const ext = colored ? "json" : "txt";
    const frameFiles = Array.from(
      { length: frameCount },
      (_, i) => `frame_${String(i + 1).padStart(4, "0")}.${ext}`,
    );

    const BATCH_SIZE = 10;
    const loadedFrames: string[] = [];

    for (let i = 0; i < frameFiles.length; i += BATCH_SIZE) {
      const batch = frameFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (filename) => {
          const response = await fetch(`/${frameFolder}/${filename}`);
          if (!response.ok) return "";
          if (colored) {
            const data: ColoredFrame = await response.json();
            return buildColoredFrameHtml(data);
          }
          return response.text();
        }),
      );
      loadedFrames.push(...results);
    }

    framesRef.current = loadedFrames.filter(Boolean);
    frameIndexRef.current = 0;
    setStatus("ready");
  }, [providedFrames, colored, frameCount, frameFolder]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadFrames();
        }
      },
      { rootMargin: "400px", threshold: 0 },
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, [loadFrames]);

  useEffect(() => {
    if (status !== "ready") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    renderFrame();

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && document.hasFocus()) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    const handleFocus = () => {
      if (isVisibleRef.current) startAnimation();
    };
    const handleBlur = () => stopAnimation();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      observer.disconnect();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      stopAnimation();
    };
  }, [status, startAnimation, stopAnimation, renderFrame]);

  return (
    <div
      ref={containerRef}
      className={`relative font-mono whitespace-pre overflow-hidden text-xs leading-none ${className}`}
    >
      {status !== "ready" && (
        <div className="text-neutral-600">
          {status === "loading" ? "Loading frames..." : ""}
        </div>
      )}
      <div className="relative">
        <div ref={displayRef} />

        {colorOverlay && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{
              background: colorOverlay,
              mixBlendMode: "color",
            }}
          />
        )}
      </div>
    </div>
  );
}
