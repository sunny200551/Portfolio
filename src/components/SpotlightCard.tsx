import React, { useRef, useState, useEffect } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(139, 92, 246, 0.15)',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const listener = () => setIsMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsFocused(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsFocused(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden glassmorphism rounded-2xl border border-white/8 p-4 sm:p-6 transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Background Spotlight Glow */}
      {!isMobile && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300 ease-out"
          style={{
            width: '350px',
            height: '350px',
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            left: `${coords.x - 175}px`,
            top: `${coords.y - 175}px`,
            opacity: isFocused ? 1 : 0,
          }}
        />
      )}
      
      {/* Card Border Glow Highlight */}
      {!isMobile && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{
            border: '1px solid transparent',
            backgroundImage: isFocused 
              ? `radial-gradient(circle 120px at ${coords.x}px ${coords.y}px, rgba(168, 85, 247, 0.4), transparent 80%)` 
              : 'none',
            backgroundClip: 'border-box',
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: isFocused ? 1 : 0,
          }}
        />
      )}

      {/* Card Contents */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
export default SpotlightCard;
