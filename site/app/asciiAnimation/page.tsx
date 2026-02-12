"use client";
import { useEffect, useRef, useState } from "react";

const AsciiAnimation = () => {
	const [frames, setFrames] = useState<string[]>([]);
	const [currentFrame, setCurrentFrame] = useState(0);
	const preRef = useRef<HTMLPreElement>(null);

	useEffect(() => {
		const fetchFrames = async () => {
			const framePromises = [];
			for (let i = 1; i <= 3; i++) {
				const frameNumber = i.toString().padStart(4, "0");
				console.log(frameNumber);
				framePromises.push(
					fetch(`/frame_${frameNumber}.txt`).then((res) => res.text()),
				);
			}
			const frames = await Promise.all(framePromises);
			setFrames(frames);
		};
		fetchFrames();
	}, []);

	useEffect(() => {
		if (frames.length === 0) return;

		const interval = setInterval(() => {
			setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
		}, 150);

		return () => clearInterval(interval);
	}, [frames]);

	return (
		<div className="flex justify-center items-center h-screen bg-white">
			<pre
				ref={preRef}
				className="text-yellow-500 bg-transparent font-mono text-xs"
				dangerouslySetInnerHTML={{ __html: frames[currentFrame] || '' }}
			/>
		</div>
	);
};

export default AsciiAnimation;
