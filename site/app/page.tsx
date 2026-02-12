"use client";

import { Rune, setRuneCdn } from "rune-ascii";

setRuneCdn("/animations");

const animations = [
  { name: "fire", colorOverlay: "linear-gradient(90deg, rgba(247,70,5,0.6) 0%, rgba(255,140,0,1) 100%)" },
  { name: "ghost" },
  { name: "fireflame" },
  { name: "danger", colorOverlay: "linear-gradient(135deg, rgba(200,0,0,0.8) 0%, rgba(255,30,30,1) 100%)" },
  { name: "loader" },
  { name: "coin" },
  { name: "earthNight" },
  { name: "earthDay" },
  { name: "saturn" },
  { name: "orangutan" },
  { name: "shoes" },
  { name: "sleepy" },
  { name: "angry" },
  { name: "idk" },
  { name: "loaderGood" },
  { name: "success" },
  { name: "error" },
  { name: "linux" },
];

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 16px" }}>
      {animations.map((anim) => (
        <section key={anim.name} style={{ marginBottom: 96 }}>
          <h2
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: 4,
              marginBottom: 12,
            }}
          >
            {anim.name}
          </h2>
          <Rune name={anim.name} colorOverlay={anim.colorOverlay} />
        </section>
      ))}
    </main>
  );
}
