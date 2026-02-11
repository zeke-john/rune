import ASCIIAnimation from "@/components/ascii-animation";

const animations = [
  {
    name: "fire",
    fps: 60,
    frameCount: 300,
    frameFolder: "frames-fire",
    colorOverlay:
      "linear-gradient(90deg, rgba(247,70,5,0.6) 0%, rgba(255,140,0,1) 100%)",
  },
  {
    name: "ghost",
    fps: 30,
    frameCount: 72,
    frameFolder: "frames-custom",
    colored: true,
  },
  {
    name: "fireflame",
    fps: 30,
    frameCount: 33,
    frameFolder: "frames-fireflame",
    colored: true,
  },
  {
    name: "danger",
    fps: 30,
    frameCount: 43,
    frameFolder: "frames-danger",
    colorOverlay:
      "linear-gradient(135deg, rgba(200,0,0,0.8) 0%, rgba(255,30,30,1) 100%)",
  },
  {
    name: "loader",
    fps: 30,
    frameCount: 58,
    frameFolder: "frames-loader",
    colored: true,
  },
  {
    name: "coin",
    fps: 30,
    frameCount: 49,
    frameFolder: "frames",
    colored: true,
  },
  {
    name: "earth",
    fps: 30,
    frameCount: 154,
    frameFolder: "frames-earth",
    colored: true,
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 space-y-24">
      {animations.map((anim) => (
        <section key={anim.name} className="space-y-3">
          <h2 className="font-mono text-sm text-neutral-500 uppercase tracking-widest">
            {anim.name}
          </h2>
          <ASCIIAnimation
            fps={anim.fps}
            frameCount={anim.frameCount}
            frameFolder={anim.frameFolder}
            colorOverlay={
              "colorOverlay" in anim ? anim.colorOverlay : undefined
            }
            colored={"colored" in anim ? anim.colored : undefined}
          />
        </section>
      ))}
    </main>
  );
}
