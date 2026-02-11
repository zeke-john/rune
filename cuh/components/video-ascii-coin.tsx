'use client';

import { useState, useEffect } from 'react';

interface VideoASCIICoinProps {
  frameLengthMs?: number;
  frameCount?: number;
}

export default function VideoASCIICoin({ 
  frameLengthMs = 150, 
  frameCount = 17 
}: VideoASCIICoinProps) {
  const [frames, setFrames] = useState<string[][]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  // Load frames from txt files
  useEffect(() => {
    const loadFrames = async () => {
      const loadedFrames: string[][] = [];
      
      for (let i = 1; i <= frameCount; i++) {
        try {
          const frameNum = i.toString().padStart(4, '0');
          const response = await fetch(`/frames/frame_${frameNum}.txt`);
          const text = await response.text();
          // Split into lines and filter out empty ones
          const lines = text.split('\n').filter(line => line.length > 0);
          loadedFrames.push(lines);
        } catch (error) {
          console.error(`Failed to load frame ${i}:`, error);
        }
      }
      
      setFrames(loadedFrames);
      setIsLoading(false);
    };

    loadFrames();
  }, [frameCount]);

  // Animation loop
  useEffect(() => {
    if (frames.length === 0 || !isAnimating) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, frameLengthMs);

    return () => clearInterval(interval);
  }, [frames.length, frameLengthMs, isAnimating]);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  if (isLoading) {
    return <div className="text-white font-mono">Loading video frames...</div>;
  }

  if (frames.length === 0) {
    return <div className="text-white font-mono">No frames loaded</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="font-mono text-xs leading-none">
        <div 
          dangerouslySetInnerHTML={{ 
            __html: frames[currentFrame]?.join('<br/>') || '' 
          }} 
        />
      </div>
      <div className="space-x-2">
        <button
          onClick={toggleAnimation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isAnimating ? 'Pause' : 'Play'}
        </button>
        <span className="text-sm text-gray-500">
          Frame: {currentFrame + 1}/{frames.length}
        </span>
      </div>
      <style jsx>{`
        :global(.y) { 
          color: #ffd700; 
        }
      `}</style>
    </div>
  );
}