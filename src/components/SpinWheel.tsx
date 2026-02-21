import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

export interface WheelSlice {
  label: string;
  color: string;
  textColor?: string;
}

interface SpinWheelProps {
  slices: WheelSlice[];
  onResult: (slice: WheelSlice, index: number) => void;
  disabled?: boolean;
}

const SPIN_DURATION = 4000;

const SpinWheel: React.FC<SpinWheelProps> = ({ slices, onResult, disabled = false }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, size: number) => {
      const center = size / 2;
      const radius = center - 8;
      const arc = (2 * Math.PI) / slices.length;

      slices.forEach((slice, i) => {
        const startAngle = i * arc;
        const endAngle = startAngle + arc;

        // Slice
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = slice.textColor || "#fff";
        ctx.font = `bold ${Math.max(11, Math.floor(size / 28))}px "DM Sans", sans-serif`;
        ctx.fillText(slice.label, radius - 16, 5);
        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(center, center, 22, 0, 2 * Math.PI);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();
      ctx.strokeStyle = "hsl(38, 80%, 55%)";
      ctx.lineWidth = 3;
      ctx.stroke();
    },
    [slices]
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    drawWheel(ctx, size);
  }, [drawWheel]);

  const spin = () => {
    if (spinning || disabled) return;
    setSpinning(true);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + extraSpins * 360 + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      // The pointer is at the top (270° in canvas terms). Determine which slice landed.
      const normalizedDeg = totalRotation % 360;
      const arc = 360 / slices.length;
      // Canvas 0° is at 3 o'clock; pointer is at top (270°). Adjust:
      const pointerAngle = (360 - normalizedDeg + 270) % 360;
      const index = Math.floor(pointerAngle / arc) % slices.length;
      setSpinning(false);
      onResult(slices[index], index);
    }, SPIN_DURATION);
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Pointer */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-warm-gold drop-shadow-lg" />
      </div>

      {/* Wheel */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: SPIN_DURATION / 1000, ease: [0.15, 0.85, 0.25, 1] }}
        className="rounded-full shadow-2xl border-4 border-secondary"
      >
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="w-[300px] h-[300px] sm:w-[340px] sm:h-[340px]"
        />
      </motion.div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-2xl tracking-wider px-10 py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {spinning ? "SPINNING..." : "SPIN!"}
      </button>
    </div>
  );
};

export default SpinWheel;
