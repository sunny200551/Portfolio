import React, { useState, useEffect } from 'react';

export const SessionLoader: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('sp_loader_seen');
  });
  const [progress, setProgress] = useState(0);
  const [slidingUp, setSlidingUp] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let startTime: number | null = null;
    const duration = 650; // Rapid ~0.65s loader

    const frame = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);

      if (p < 100) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          setSlidingUp(true);
          sessionStorage.setItem('sp_loader_seen', '1');
          setTimeout(() => setVisible(false), 350);
        }, 120);
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-[#FFFFFF] flex flex-col items-center justify-center p-6 text-[#0A0A0A] select-none transition-transform duration-300 ease-in-out border-b-4 border-[#0A0A0A] ${
        slidingUp ? '-translate-y-full' : 'translate-y-0'
      }`}
      aria-label="Loading portfolio"
    >
      <div className="flex flex-col items-center gap-6 max-w-xs w-full text-center">
        {/* SP Brand Mark */}
        <div className="w-16 h-16 bg-[#FF5A1F] text-black font-display font-black text-2xl flex items-center justify-center border-4 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] animate-pulse">
          SP
        </div>

        {/* Status Line */}
        <div className="space-y-1">
          <div className="font-display font-black text-xl uppercase tracking-tight text-[#0A0A0A]">
            SUNNY PASUMARTHI
          </div>
          <div className="font-mono text-xs font-bold text-[#0047AB] uppercase">
            SYSTEM BOOT // {progress}%
          </div>
        </div>

        {/* High-Contrast Progress Bar */}
        <div className="w-full h-3.5 bg-[#EEF2FA] border-2 border-[#0A0A0A] p-0.5 shadow-[3px_3px_0px_#0A0A0A]">
          <div
            className="h-full bg-[#FF5A1F] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionLoader;
