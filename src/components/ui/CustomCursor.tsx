import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return true;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !isFinePointer || isCoarse || noHover || prefersReducedMotion;
  });
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic media query listeners for device / orientation changes
    const fineQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateTouchStatus = () => {
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const noHover = window.matchMedia('(hover: none)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsTouchDevice(!isFinePointer || isCoarse || noHover || prefersReducedMotion);
    };

    fineQuery.addEventListener('change', updateTouchStatus);
    motionQuery.addEventListener('change', updateTouchStatus);

    return () => {
      fineQuery.removeEventListener('change', updateTouchStatus);
      motionQuery.removeEventListener('change', updateTouchStatus);
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) {
        setIsHidden(false);
        return;
      }

      // Hide cursor completely:
      // 1. Inside the Events panel or modal
      // 2. Over inputs, textareas, selects, and editable fields
      // 3. Elements marked .no-custom-cursor
      const isInsideEventsOrInput = !!target.closest(
        '#events, [data-section="events"], .events-modal-portal, input, textarea, select, [contenteditable="true"], .no-custom-cursor'
      );

      if (isInsideEventsOrInput) {
        setIsHidden(true);
        return;
      }

      setIsHidden(false);

      // Check if target is an interactive clickable element
      const isInteractive = !!target.closest('button, a, [role="button"], input[type="submit"]');
      setIsHovering(isInteractive);
    };

    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isTouchDevice]);

  if (isTouchDevice || isHidden) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 ${
          isHovering
            ? 'w-6 h-6 border-2 border-[#FF5A1F] bg-transparent shadow-[2px_2px_0px_#0A0A0A]'
            : 'w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]'
        }`}
      />
    </div>
  );
};
