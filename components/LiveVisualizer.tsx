import React, { useEffect, useRef } from 'react';

interface LiveVisualizerProps {
  isActive: boolean;
  volume: number; // 0-255
}

const LiveVisualizer: React.FC<LiveVisualizerProps> = ({ isActive, volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!isActive) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      // Normalize volume to radius
      const baseRadius = 30;
      const dynamicRadius = baseRadius + (volume / 255) * 40;

      // Draw Apple-siri-like blobs
      // Blob 1
      ctx.beginPath();
      ctx.fillStyle = `rgba(50, 200, 255, 0.6)`;
      ctx.filter = 'blur(20px)';
      ctx.arc(centerX + Math.sin(phase) * 10, centerY + Math.cos(phase) * 10, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      // Blob 2
      ctx.beginPath();
      ctx.fillStyle = `rgba(200, 50, 255, 0.6)`;
      ctx.filter = 'blur(20px)';
      ctx.arc(centerX - Math.sin(phase * 1.5) * 15, centerY - Math.cos(phase * 1.2) * 15, dynamicRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      phase += 0.05;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, volume]);

  return <canvas ref={canvasRef} width={300} height={300} className="w-full h-full" />;
};

export default LiveVisualizer;
