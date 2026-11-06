import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  vx: number;
  vy: number;
  rotSpeed: number;
}

const PALETTE = ['#FFFFFF', '#0A0A0A', '#0A1A3F', '#0047AB', '#FF5A1F'];

const generatePieces = (): ConfettiPiece[] => {
  return Array.from({ length: 45 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    return {
      id: i,
      x: 50, // center %
      y: 40, // origin %
      size: 8 + Math.random() * 8,
      color: PALETTE[i % PALETTE.length],
      rotation: Math.random() * 360,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      rotSpeed: (Math.random() - 0.5) * 15
    };
  });
};

export const FlatConfetti: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>(generatePieces);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();

    const update = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 2800) {
        if (onComplete) onComplete();
        return;
      }

      setPieces((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx * 0.15,
          y: p.y + p.vy * 0.15,
          vy: p.vy + 0.18, // gravity
          rotation: p.rotation + p.rotSpeed
        }))
      );

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute border border-[#0A0A0A]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.8}px`,
            backgroundColor: p.color,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            boxShadow: '1px 1px 0px #0A0A0A'
          }}
        />
      ))}
    </div>
  );
};

export default FlatConfetti;
