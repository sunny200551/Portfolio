import React, { useEffect, useRef } from 'react';

const row1 = [
  'REACT 19',
  'TYPESCRIPT',
  'TAILWIND CSS',
  'JAVASCRIPT',
  'HTML5 & CSS3',
  'NODE.JS',
  'FIREBASE',
  'GIT & GITHUB',
];

const row2 = [
  'WEB3 BASICS',
  'SOLIDITY',
  'PYTHON',
  'C PROGRAMMING',
  'EXPRESS',
  'MONGODB',
  'DATA STRUCTURES',
  'FIGMA',
];

export const SkillsMarquee: React.FC = () => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const chunk1Ref = useRef<HTMLDivElement>(null);
  const chunk2Ref = useRef<HTMLDivElement>(null);

  const lastScrollY = useRef(0);
  const scrollDirection = useRef(1); // 1 = down, -1 = up
  const speedMultiplier = useRef(1);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let pos1 = 0;
    let pos2 = 0;
    let animId: number;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const diff = currentScroll - lastScrollY.current;
      if (Math.abs(diff) > 2) {
        scrollDirection.current = diff > 0 ? 1 : -1;
        speedMultiplier.current = Math.min(3.5, 1 + Math.abs(diff) * 0.04);
      }
      lastScrollY.current = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = () => {
      // Natural decay back to baseline speed
      speedMultiplier.current += (1 - speedMultiplier.current) * 0.05;

      const baseSpeed = 0.75 * speedMultiplier.current;
      const delta1 = baseSpeed * scrollDirection.current;
      const delta2 = -baseSpeed * scrollDirection.current;

      pos1 += delta1;
      pos2 += delta2;

      const chunk1Width = chunk1Ref.current ? chunk1Ref.current.offsetWidth : 1200;
      const chunk2Width = chunk2Ref.current ? chunk2Ref.current.offsetWidth : 1200;

      // Mathematical modulo wrap to guarantee 100% gapless continuity in both directions
      if (chunk1Width > 0) {
        pos1 = ((pos1 % chunk1Width) + chunk1Width) % chunk1Width;
      }
      if (chunk2Width > 0) {
        pos2 = ((pos2 % chunk2Width) + chunk2Width) % chunk2Width;
      }

      if (row1Ref.current) {
        row1Ref.current.style.transform = `translate3d(${-pos1}px, 0, 0)`;
      }
      if (row2Ref.current) {
        row2Ref.current.style.transform = `translate3d(${-pos2}px, 0, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full bg-[#0047AB] text-white border-y-2 border-[#0A0A0A] py-3.5 sm:py-4 overflow-hidden relative select-none z-10 font-mono text-xs font-bold tracking-wider">
      {/* Row 1 */}
      <div className="flex whitespace-nowrap mb-2.5 overflow-hidden">
        <div ref={row1Ref} className="flex will-change-transform">
          {/* Chunk 1 (Measured) */}
          <div ref={chunk1Ref} className="flex gap-8 items-center shrink-0 pr-8">
            {row1.map((item, idx) => (
              <div key={`r1-c1-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-white hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-[#FF5A1F] border border-[#0A0A0A]" />
              </div>
            ))}
          </div>

          {/* Chunk 2 */}
          <div className="flex gap-8 items-center shrink-0 pr-8" aria-hidden="true">
            {row1.map((item, idx) => (
              <div key={`r1-c2-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-white hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-[#FF5A1F] border border-[#0A0A0A]" />
              </div>
            ))}
          </div>

          {/* Chunk 3 */}
          <div className="flex gap-8 items-center shrink-0 pr-8" aria-hidden="true">
            {row1.map((item, idx) => (
              <div key={`r1-c3-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-white hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-[#FF5A1F] border border-[#0A0A0A]" />
              </div>
            ))}
          </div>

          {/* Chunk 4 */}
          <div className="flex gap-8 items-center shrink-0 pr-8" aria-hidden="true">
            {row1.map((item, idx) => (
              <div key={`r1-c4-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-white hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-[#FF5A1F] border border-[#0A0A0A]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex whitespace-nowrap overflow-hidden">
        <div ref={row2Ref} className="flex will-change-transform">
          {/* Chunk 1 (Measured) */}
          <div ref={chunk2Ref} className="flex gap-8 items-center shrink-0 pr-8">
            {row2.map((item, idx) => (
              <div key={`r2-c1-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-[#EEF2FA] hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-white border border-[#0A0A0A]" />
              </div>
            ))}
          </div>

          {/* Chunk 2 */}
          <div className="flex gap-8 items-center shrink-0 pr-8" aria-hidden="true">
            {row2.map((item, idx) => (
              <div key={`r2-c2-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-[#EEF2FA] hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-white border border-[#0A0A0A]" />
              </div>
            ))}
          </div>

          {/* Chunk 3 */}
          <div className="flex gap-8 items-center shrink-0 pr-8" aria-hidden="true">
            {row2.map((item, idx) => (
              <div key={`r2-c3-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-[#EEF2FA] hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-white border border-[#0A0A0A]" />
              </div>
            ))}
          </div>

          {/* Chunk 4 */}
          <div className="flex gap-8 items-center shrink-0 pr-8" aria-hidden="true">
            {row2.map((item, idx) => (
              <div key={`r2-c4-${idx}`} className="flex items-center gap-4">
                <span className="uppercase text-[#EEF2FA] hover:text-[#FF5A1F] transition-colors">{item}</span>
                <span className="w-2 h-2 bg-white border border-[#0A0A0A]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsMarquee;
