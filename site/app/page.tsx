"use client";

import { useState } from "react";
import { Rune, setRuneCdn } from "rune-ascii";

setRuneCdn("/animations");

const animations = [
  {
    name: "fire",
    label: "Campfire",
    colorOverlay:
      "linear-gradient(90deg, rgba(247,70,5,0.6) 0%, rgba(255,140,0,1) 100%)",
  },
  { name: "ghost", label: "Ghost" },
  { name: "fireflame", label: "Flame" },
  {
    name: "danger",
    label: "Hazard",
    colorOverlay:
      "linear-gradient(135deg, rgba(200,0,0,0.8) 0%, rgba(255,30,30,1) 100%)",
  },
  { name: "loader", label: "Spinner" },
  { name: "coin", label: "Gold Coin" },
  { name: "earthNight", label: "Earth Night" },
  { name: "earthDay", label: "Earth Day" },
  { name: "saturn", label: "Saturn" },
  { name: "orangutan", label: "Orangutan" },
  { name: "shoes", label: "Sneakers" },
  { name: "sleepy", label: "Sleepy" },
  { name: "angry", label: "Rage" },
  { name: "idk", label: "Geeked" },
  { name: "loaderGood", label: "Spinner 2" },
  { name: "success", label: "Success" },
  { name: "error", label: "Error" },
  { name: "linux", label: "Tux" },
  { name: "rocket", label: "Rocket" },
  { name: "sideFlames", label: "Side Flames" },
  { name: "cubes", label: "Cubes" },
  { name: "dawg", label: "Dawg" },
  { name: "cubesInnaGlass", label: "Cubes in Glass w/ BG" },
  { name: "arrow", label: "Arrow" },
];

type Size = "s" | "m" | "l";

const CONTAINER_WIDTH = 800;

const COLUMNS: Record<Size, number> = { s: 50, m: 90, l: 160 };

function getSrc(name: string, size: Size): string {
  if (size === "m") return `/animations/${name}.rune.json`;
  return `/animations/${name}.${size}.rune.json`;
}

function getFontSize(size: Size): number {
  return CONTAINER_WIDTH / COLUMNS[size] / 0.6;
}

const SIZE_LABELS: Record<Size, string> = { s: "Low", m: "Med", l: "High" };

function DetailToggle({
  active,
  onChange,
}: {
  active: Size;
  onChange: (s: Size) => void;
}) {
  const sizes: Size[] = ["s", "m", "l"];
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {sizes.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            background: active === s ? "#3b82f6" : "#222",
            color: active === s ? "#fff" : "#666",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {SIZE_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

function AnimationCard({
  name,
  label,
  colorOverlay,
}: {
  name: string;
  label: string;
  colorOverlay?: string;
}) {
  const [size, setSize] = useState<Size>("m");

  return (
    <section style={{ marginBottom: 96 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {label}
        </h2>
        <DetailToggle active={size} onChange={setSize} />
      </div>
      <Rune
        key={`${name}-${size}`}
        src={getSrc(name, size)}
        colorOverlay={colorOverlay}
        style={{ width: CONTAINER_WIDTH, fontSize: getFontSize(size) }}
      />
    </section>
  );
}

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 16px" }}>
      {animations.map((anim) => (
        <AnimationCard
          key={anim.name}
          name={anim.name}
          label={anim.label}
          colorOverlay={anim.colorOverlay}
        />
      ))}
    </main>
  );
}
