import React, { useState } from 'react';
import { robotStore } from '../../robot/robotStore';

interface SittingSteveProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SittingSteve: React.FC<SittingSteveProps> = ({ className = '', style }) => {
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [isWinking, setIsWinking] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 800);

    const { visitorName, visitorGender } = robotStore.getState();
    const isWoman = visitorGender === 'woman';
    const isMan = visitorGender === 'man';
    const name = visitorName || (isWoman ? 'gorgeous' : isMan ? 'king' : 'friend');

    if (isWoman) {
      setBubbleText(`Sunny replies FASTEST on Instagram! But don't forget to visit me too, ${name}! 😉💌`);
    } else if (isMan) {
      setBubbleText(`Instagram and LinkedIn get same-day replies, ${name}! Best places to connect! ⚡🤝`);
    } else {
      setBubbleText('Sunny replies FASTEST on Instagram & LinkedIn! DM him there! ⚡💬');
    }

    setTimeout(() => setBubbleText(null), 4500);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative select-none cursor-pointer group ${className}`}
      style={style}
      title="Click Steve to ask how to reach Sunny!"
    >
      <style>{`
        @keyframes steveSwingLeft {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes steveSwingRight {
          0%, 100% { transform: rotate(14deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes steveArmWave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-32deg); }
        }
        @keyframes steveHeadBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(1.5deg); }
        }
        .anim-steve-leg-left {
          transform-origin: 22px 52px;
          animation: steveSwingLeft 2.2s ease-in-out infinite;
        }
        .anim-steve-leg-right {
          transform-origin: 38px 52px;
          animation: steveSwingRight 2.2s ease-in-out infinite;
        }
        .anim-steve-arm-wave {
          transform-origin: 52px 36px;
          animation: steveArmWave 1.4s ease-in-out infinite;
        }
        .anim-steve-head {
          transform-origin: 30px 24px;
          animation: steveHeadBob 3s ease-in-out infinite;
        }
      `}</style>

      {/* Speech bubble */}
      {bubbleText && (
        <div className="absolute -top-16 -left-16 sm:-left-8 z-50 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] px-3 py-2 text-[11px] font-mono font-bold w-[210px] leading-tight text-center animate-in fade-in zoom-in-95 pointer-events-none">
          <div className="text-[9px] text-[#FF5A1F] font-black uppercase tracking-wider mb-0.5">
            STEVE DISPATCH ⚡
          </div>
          {bubbleText}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid #0A0A0A',
            }}
          />
        </div>
      )}

      {/* SVG Seated Steve Artwork (Clean Neo-Brutalist Vector) */}
      <svg
        viewBox="0 0 70 85"
        className="w-16 h-20 sm:w-20 sm:h-24 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] overflow-visible"
      >
        {/* Dangling Legs (Over the box edge) */}
        {/* Left Leg */}
        <g className="anim-steve-leg-left">
          <rect x="18" y="52" width="8" height="22" rx="2" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />
          <rect x="15" y="70" width="14" height="6" rx="2" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />
        </g>
        {/* Right Leg */}
        <g className="anim-steve-leg-right">
          <rect x="34" y="52" width="8" height="22" rx="2" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="2" />
          <rect x="31" y="70" width="14" height="6" rx="2" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />
        </g>

        {/* Torso */}
        <rect x="14" y="30" width="32" height="24" rx="3" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2.5" />
        {/* Chest Panel */}
        <rect x="20" y="35" width="20" height="13" rx="1.5" fill="#0A1A3F" stroke="#0A0A0A" strokeWidth="1.5" />
        <rect x="23" y="38" width="6" height="7" fill="#FF5A1F" />
        <rect x="31" y="38" width="6" height="7" fill="#FFFFFF" />

        {/* Left Arm Resting on Box Border */}
        <g>
          <path d="M14 36 L4 44 L8 50" fill="none" stroke="#0A1A3F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="4" y="46" width="7" height="6" rx="1.5" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />
        </g>

        {/* Right Arm Waving in the Air */}
        <g className="anim-steve-arm-wave">
          <path d="M46 36 L58 26 L64 16" fill="none" stroke="#0A1A3F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="60" y="11" width="8" height="8" rx="2" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />
        </g>

        {/* Head + Antenna (Gently Bobbing) */}
        <g className="anim-steve-head">
          {/* Antenna */}
          <line x1="30" y1="8" x2="30" y2="2" stroke="#0A1A3F" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="30" cy="2" r="3" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="1.5" />

          {/* Head Box */}
          <rect x="10" y="8" width="40" height="24" rx="4" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2.5" />
          {/* Screen Visor */}
          <rect x="15" y="12" width="30" height="16" rx="2" fill="#0047AB" stroke="#0A0A0A" strokeWidth="1.5" />

          {/* Sunglasses or Smiling Eyes */}
          {/* Left Eye / Lens */}
          <rect x="18" y="15" width="10" height="8" rx="1" fill="#0A0A0A" stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="23" y="16" width="2" height="2" fill="#FFFFFF" />

          {/* Bridge */}
          <rect x="28" y="17" width="4" height="2" fill="#0A0A0A" />

          {/* Right Eye / Lens */}
          <rect x="32" y="15" width="10" height="8" rx="1" fill="#0A0A0A" stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="37" y="16" width="2" height="2" fill="#FFFFFF" />

          {/* Visor Glint / Smile */}
          {isWinking ? (
            <path d="M26 24 Q30 27 34 24" stroke="#FFD700" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M27 24 Q30 26 33 24" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
};

export default SittingSteve;
