import { useEffect, useRef } from 'react';

export default function HeartPulseMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const drawECG = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Set styles
      ctx.strokeStyle = '#22d3ee'; // Bright cyan/teal
      ctx.lineWidth = 2;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 6;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      
      const centerY = height / 2;
      const period = 150; // Pixels per heartbeat
      
      for (let x = 0; x < width; x++) {
        // Calculate position in the heartbeat cycle (0 to 1)
        const cyclePos = ((x + offset) % period) / period;
        let y = centerY;

        // P-QRS-T complex simulation
        if (cyclePos > 0.1 && cyclePos < 0.15) {
          // P wave
          y = centerY - Math.sin((cyclePos - 0.1) * 20 * Math.PI) * 4;
        } else if (cyclePos > 0.2 && cyclePos < 0.22) {
          // Q wave (dip)
          y = centerY + 4;
        } else if (cyclePos >= 0.22 && cyclePos < 0.25) {
          // R wave (sharp spike)
          y = centerY - 18;
        } else if (cyclePos >= 0.25 && cyclePos < 0.28) {
          // S wave (sharp dip)
          y = centerY + 8;
        } else if (cyclePos > 0.4 && cyclePos < 0.5) {
          // T wave
          y = centerY - Math.sin((cyclePos - 0.4) * 10 * Math.PI) * 6;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      // Scroll speed (decreasing offset moves pattern right to left? No, we want left to right)
      // If x is rendering at `cyclePos = (x + offset)`, decreasing offset shifts the pattern right.
      offset -= 1.5;
      if (offset < 0) {
        offset += period;
      }

      animationFrameId = requestAnimationFrame(drawECG);
    };

    drawECG();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={40}
      className="block"
      style={{ filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))' }}
    />
  );
}
