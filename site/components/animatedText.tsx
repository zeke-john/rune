'use client'


export default function AnimatedText({ text }: { text: string }) {

  return (
    <p className="max-w-2xl mt-12 leading-loose">
      {text.split("").map((char, index) => (
        <span
          key={char + index.toString()}
          style={{ transitionDelay: `${500 * (index / 50)}ms` }}
          className="inline-block starting:opacity-25 opacity-100 duration-750 transition-all"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>);
};

