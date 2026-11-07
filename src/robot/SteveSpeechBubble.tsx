import React, { useState, useEffect, useRef, useCallback } from 'react';
import { splitIntoPages, calculateReadingDwellTime } from './speechPaging';


export interface SteveSpeechBubbleProps {
  text: string;
  onDismiss: () => void;
  isCenterStage?: boolean;
  windowWidth: number;
  prefersReducedMotion?: boolean;
  visitorGender?: string;
  steveX?: number; // Position X of Steve in viewport (defaults to 32px or center)
}

export const SteveSpeechBubble: React.FC<SteveSpeechBubbleProps> = ({
  text,
  onDismiss,
  isCenterStage = false,
  windowWidth,
  prefersReducedMotion = false,
  visitorGender = 'guest',
  steveX = 32,
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>(() => splitIntoPages(text, 140));
  const [pageIndex, setPageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [remainingMs, setRemainingMs] = useState(3000);
  const [totalDwellMs, setTotalDwellMs] = useState(3000);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(() => (typeof document !== 'undefined' ? document.hidden : false));

  // Reset when input text changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const newPages = splitIntoPages(text, 140);
      setPages(newPages);
      setPageIndex(0);
      setCharIndex(prefersReducedMotion ? newPages[0].length : 0);
      setIsRevealed(prefersReducedMotion);
    }, 0);
    return () => clearTimeout(timer);
  }, [text, prefersReducedMotion]);

  const currentPageText = pages[pageIndex] || text;

  // Track tab visibility changes to pause reading timer
  useEffect(() => {
    const handleVisChange = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  }, []);

  // 1. Progressive letter reveal (approx 35ms per char with punctuation pauses)
  useEffect(() => {
    if (isRevealed) {
      window.dispatchEvent(new CustomEvent('steve:talking', { detail: { talking: false } }));
      return;
    }

    if (prefersReducedMotion) {
      setTimeout(() => {
        setCharIndex(currentPageText.length);
        setIsRevealed(true);
      }, 0);
      window.dispatchEvent(new CustomEvent('steve:talking', { detail: { talking: false } }));
      return;
    }

    // Steve starts talking during letter reveal
    window.dispatchEvent(new CustomEvent('steve:talking', { detail: { talking: true } }));

    if (charIndex >= currentPageText.length) {
      setTimeout(() => {
        setIsRevealed(true);
        window.dispatchEvent(new CustomEvent('steve:talking', { detail: { talking: false } }));
      }, 0);
      return;
    }

    const currentChar = currentPageText[charIndex];
    let delay = 35; // base char speed

    // Punctuation pauses for natural pacing
    if (currentChar === ',' || currentChar === ';' || currentChar === '—' || currentChar === '-') {
      delay = 120;
    } else if (currentChar === '.' || currentChar === '!' || currentChar === '?') {
      delay = 280;
    }

    const timer = setTimeout(() => {
      setCharIndex((prev) => Math.min(currentPageText.length, prev + 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [charIndex, currentPageText, isRevealed, prefersReducedMotion]);

  // 2. Reading Dwell Timer after reveal finishes
  useEffect(() => {
    if (!isRevealed) return;

    const dwell = calculateReadingDwellTime(currentPageText);
    setTimeout(() => {
      setTotalDwellMs(dwell);
      setRemainingMs(dwell);
    }, 0);
  }, [isRevealed, currentPageText]);

  // Countdown timer with pause on hover, focus, or hidden tab
  useEffect(() => {
    if (!isRevealed) return;

    const interval = setInterval(() => {
      if (isHovered || isFocused || isTabHidden) return;

      setRemainingMs((prev) => {
        const next = prev - 50;
        if (next <= 0) {
          clearInterval(interval);
          if (pageIndex < pages.length - 1) {
            setPageIndex((p) => p + 1);
            setCharIndex(prefersReducedMotion ? (pages[pageIndex + 1] || '').length : 0);
            setIsRevealed(prefersReducedMotion);
          } else {
            onDismiss();
          }
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRevealed, isHovered, isFocused, isTabHidden, pageIndex, pages, prefersReducedMotion, onDismiss]);

  // 3. Click interaction: Click 1 completes reveal; Click 2 advances or dismisses
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!isRevealed) {
        setCharIndex(currentPageText.length);
        setIsRevealed(true);
        window.dispatchEvent(new CustomEvent('steve:talking', { detail: { talking: false } }));
      } else {
        if (pageIndex < pages.length - 1) {
          setPageIndex((p) => p + 1);
          setCharIndex(prefersReducedMotion ? (pages[pageIndex + 1] || '').length : 0);
          setIsRevealed(prefersReducedMotion);
        } else {
          onDismiss();
        }
      }
    },
    [isRevealed, currentPageText, pageIndex, pages, prefersReducedMotion, onDismiss]
  );

  const timerProgress = isRevealed ? Math.max(0, Math.min(1, remainingMs / totalDwellMs)) : 1.0;

  return (
    <div
      ref={bubbleRef}
      data-testid="steve-speech-bubble"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="status"
      aria-live="polite"
      className="absolute z-50 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] cursor-pointer select-none text-left focus:outline-none focus:ring-2 focus:ring-[#FF5C00]"
      style={{
        left: isCenterStage ? '50%' : `${Math.max(8, Math.min(steveX ?? 14, (windowWidth || 1200) - 290))}px`,
        transform: isCenterStage ? 'translateX(-50%)' : 'none',
        bottom: 'calc(100% - 12px)',
        width: 'max-content',
        minWidth: '180px',
        maxWidth: '280px',
        wordBreak: 'break-word',
        overflow: 'visible',
      }}
      title="Click once to finish text; click again to close"
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-1.5 px-3 pt-2 pb-1 border-b border-[#0A0A0A]/15 text-[9px] font-mono font-black uppercase text-[#FF5C00] tracking-wider">
        <div className="flex items-center gap-1.5">
          <span>STEVE</span>
          <span>{(visitorGender === 'woman' || visitorGender === 'female') ? '❤️' : '⚡'}</span>
        </div>
        {pages.length > 1 && (
          <span className="text-[8px] px-1.5 py-0.2 bg-[#EEF2FA] text-[#0A0A0A] border border-[#0A0A0A]">
            {pageIndex + 1}/{pages.length}
          </span>
        )}
      </div>

      {/* Main Content Area: Pre-allocated Ghost Container (No Jitter) */}
      <div className="relative px-3.5 py-2.5 font-mono text-xs font-bold text-[#0A0A0A] leading-snug">
        <div className="invisible pointer-events-none select-none" aria-hidden="true">
          {currentPageText}
        </div>

        <div className="absolute inset-0 px-3.5 py-2.5">
          <span>{currentPageText.slice(0, charIndex)}</span>
          {!isRevealed && (
            <span
              className="inline-block w-1.5 h-3 bg-[#FF5C00] ml-0.5 align-middle animate-pulse"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Flat Orange Reading Timer Bar along bottom edge */}
      <div className="w-full h-1 bg-[#EEF2FA] overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-[#FF5C00] transition-none origin-left"
          style={{ width: `${Math.round(timerProgress * 100)}%` }}
        />
      </div>

      {/* Downward tail pointing down toward Steve's head */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: isCenterStage ? '50%' : '66px',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #0A0A0A',
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% - 2px)',
          left: isCenterStage ? '50%' : '66px',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '4.5px solid transparent',
          borderRight: '4.5px solid transparent',
          borderTop: '4.5px solid #FFFFFF',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default SteveSpeechBubble;
