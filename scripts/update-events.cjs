const fs = require('fs');

let code = fs.readFileSync('src/sections/Events.tsx', 'utf8');

// 1. Add import of getLenis
code = code.replace(
  "import { getAllEvents, type EventItem, type EventType } from '../data/events';",
  "import { getAllEvents, type EventItem, type EventType } from '../data/events';\r\nimport { getLenis } from '../components/ui/SmoothScroll';"
);

// 2. Add modalContainerRef
code = code.replace(
  "  const modalCloseRef = useRef<HTMLButtonElement>(null);",
  "  const modalCloseRef = useRef<HTMLButtonElement>(null);\r\n  const modalContainerRef = useRef<HTMLDivElement>(null);"
);

// 3. Update useEffect for modal open/close, Lenis stop/start, and focus trap
const oldEffect = `  // Lock body scroll and pause Lenis when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('lenis-stopped');
      // Focus close button on open
      setTimeout(() => {
        modalCloseRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedEvent(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.documentElement.classList.remove('lenis-stopped');
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stopped');
    }
  }, [selectedEvent]);`.replace(/\n/g, '\r\n');

const newEffect = `  // Lock body scroll, pause Lenis, manage focus trap, and inert fixed UI when modal is open
  useEffect(() => {
    if (selectedEvent) {
      // 1. Pause Lenis smooth scrolling strictly
      getLenis()?.stop();
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('lenis-stopped');

      // 2. Hide / inert background fixed elements (rails, buttons) so modal is strictly on top
      const fixedElements = Array.from(document.querySelectorAll('.fixed:not([role=\"dialog\"])')) as HTMLElement[];
      fixedElements.forEach((el) => {
        el.setAttribute('aria-hidden', 'true');
        el.style.pointerEvents = 'none';
      });

      // 3. Focus management
      setTimeout(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.focus();
        } else {
          modalCloseRef.current?.focus();
        }
      }, 30);

      // 4. Keyboard trap: Tab loop & Escape to close
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedEvent(null);
          return;
        }

        if (e.key === 'Tab' && modalContainerRef.current) {
          const focusable = modalContainerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'
          );
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        getLenis()?.start();
        document.body.style.overflow = '';
        document.documentElement.classList.remove('lenis-stopped');
        fixedElements.forEach((el) => {
          el.removeAttribute('aria-hidden');
          el.style.pointerEvents = '';
        });
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      getLenis()?.start();
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stopped');
    }
  }, [selectedEvent]);`.replace(/\n/g, '\r\n');

if (!code.includes(oldEffect)) {
  console.error('oldEffect not found in Events.tsx!');
  process.exit(1);
}

code = code.replace(oldEffect, newEffect);

// 4. Update the modal container JSX (z-[100], data-lenis-prevent, overscroll-contain, tabIndex 0)
const oldModalJsx = `      {/* Full-Screen Detail Modal Panel */}
      {selectedEvent && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-event-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/70"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-4 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >`.replace(/\n/g, '\r\n');

const newModalJsx = `      {/* Full-Screen Detail Modal Panel (z-[100] strictly above all fixed UI) */}
      {selectedEvent && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-event-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/75 backdrop-blur-[1px]"
          onClick={handleCloseModal}
        >
          <div
            ref={modalContainerRef}
            data-lenis-prevent="true"
            tabIndex={0}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-white border-4 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] p-6 sm:p-8 relative outline-none focus:ring-2 focus:ring-[#0047AB]"
            onClick={(e) => e.stopPropagation()}
          >`.replace(/\n/g, '\r\n');

if (!code.includes(oldModalJsx)) {
  console.error('oldModalJsx not found in Events.tsx!');
  process.exit(1);
}

code = code.replace(oldModalJsx, newModalJsx);

fs.writeFileSync('src/sections/Events.tsx', code, 'utf8');
console.log('Successfully updated Events.tsx with Lenis prevent, focus trap, and z-[100] overlay');

