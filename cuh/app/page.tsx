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
    name: "earth NIGHT",
    fps: 30,
    frameCount: 154,
    frameFolder: "frames-earth",
    colored: true,
  },
  {
    name: "earth day",
    fps: 30,
    frameCount: 59,
    frameFolder: "frames-earthday",
    colored: true,
  },
  {
    name: "saturn",
    fps: 30,
    frameCount: 164,
    frameFolder: "frames-saturn",
    colored: true,
  },
  {
    name: "orangutan",
    fps: 30,
    frameCount: 115,
    frameFolder: "frames-orangutan",
    colored: true,
  },
  {
    name: "shoes",
    fps: 30,
    frameCount: 94,
    frameFolder: "frames-shoes",
    colored: true,
  },
  {
    name: "sleepy boi",
    fps: 30,
    frameCount: 44,
    frameFolder: "frames-sleepyboi",
    colored: true,
  },
  {
    name: "angry boi",
    fps: 30,
    frameCount: 89,
    frameFolder: "frames-angryboi",
    colored: true,
  },
  {
    name: "idk",
    fps: 30,
    frameCount: 106,
    frameFolder: "frames-idk",
    colored: true,
  },
  {
    name: "loader good",
    fps: 30,
    frameCount: 49,
    frameFolder: "frames-loadergood",
    colored: true,
  },
  {
    name: "success",
    fps: 30,
    frameCount: 93,
    frameFolder: "frames-success",
    colored: true,
  },
  {
    name: "error",
    fps: 30,
    frameCount: 66,
    frameFolder: "frames-error",
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
