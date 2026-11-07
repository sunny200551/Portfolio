import React, { useState, useEffect, useRef } from 'react';
import { Download, ArrowRight, Mail } from 'lucide-react';
import { CONTACT_INFO } from '../data/contact';
import type { GitHubProfile } from '../hooks/useGitHubData';
import { robotStore } from '../robot/robotStore';
import { RobotDebugOverlay } from '../robot/RobotDebugOverlay';
import { HeroIllustration } from '../components/three/HeroIllustration';

interface HeroProps {
  onContactClick: () => void;
  profile?: GitHubProfile | null;
}

export const Hero: React.FC<HeroProps> = ({ onContactClick, profile }) => {
  const fallbackAvatar = profile?.avatar_url || 'https://github.com/sunny200551.png';
  const [boltScreen, setBoltScreen] = useState(() => robotStore.getState().boltScreenPos);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const unsubscribe = robotStore.subscribe(() => {
      setBoltScreen(robotStore.getState().boltScreenPos);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section 
      ref={heroRef}
      id="home" 
      className="relative min-h-[92svh] flex items-center justify-center px-4 sm:px-6 lg:px-12 py-16 sm:py-24 overflow-hidden z-10 bg-transparent text-[#0A0A0A]"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Clear, Protected Text & Identity Zone */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6 z-20">
          
          {/* Available for Opportunities Chip with ample spacing */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
            <span>AVAILABLE FOR OPPORTUNITIES</span>
          </div>

          {/* Photo & Giant Poster Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Square Profile Photo with 3px Black Border and Offset Orange Block */}
            <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32">
              <div 
                className="absolute inset-0 bg-[#FF5A1F] translate-x-2.5 translate-y-2.5 border-[3px] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]" 
                aria-hidden="true" 
              />
              <div className="relative w-full h-full bg-[#0047AB] border-[3px] border-[#0A0A0A] overflow-hidden flex items-center justify-center">
                <img
                  src="/profile.webp"
                  alt="Sunny Pasumarthi - Computer Science Student & Frontend Developer"
                  width={128}
                  height={128}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.includes(fallbackAvatar)) {
                      img.src = fallbackAvatar;
                    } else if (!img.src.endsWith('/avatar.png')) {
                      img.src = '/avatar.png';
                    }
                  }}
                />
              </div>
            </div>

            {/* Name */}
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter text-[#0A0A0A] leading-[0.92]">
              <span>SUNNY</span>{' '}
              <span className="inline-block px-3 sm:px-4 py-0.5 bg-[#0047AB] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] mt-1 sm:mt-0">
                PASUMARTHI
              </span>
            </h1>
          </div>

          {/* Static Tagline: single line with small orange squares (stacked on mobile) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] mt-1">
            <span>Computer Science Student</span>
            <span className="hidden sm:inline-block w-2 h-2 bg-[#FF5A1F] border border-[#0A0A0A] shrink-0" aria-hidden="true" />
            <span>Frontend Developer</span>
            <span className="hidden sm:inline-block w-2 h-2 bg-[#FF5A1F] border border-[#0A0A0A] shrink-0" aria-hidden="true" />
            <span>Blockchain Enthusiast</span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mt-2 font-mono text-xs uppercase font-bold w-full sm:w-auto">
            <button
              data-robot-react="hero:get-in-touch"
              onClick={onContactClick}
              onMouseEnter={() => window.dispatchEvent(new CustomEvent('robot:action', { detail: 'jump' }))}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent('robot:action', { detail: 'idle' }))}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer"
            >
              <span>GET IN TOUCH</span>
              <ArrowRight size={14} />
            </button>
            
            <a
              data-robot-react="hero:download-resume"
              href="/Resume.pdf"
              download="Sunny_Pasumarthi_Resume.pdf"
              onMouseEnter={() => window.dispatchEvent(new CustomEvent('robot:action', { detail: 'salute' }))}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent('robot:action', { detail: 'idle' }))}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#EEF2FA] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#0A0A0A] transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>DOWNLOAD RESUME</span>
            </a>
          </div>

          {/* Square Black-Bordered Social Buttons */}
          <div className="flex gap-2.5 items-center font-mono text-xs mt-1">
            <a
              href="https://github.com/sunny200551"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center hover:bg-[#FF5A1F] hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="GitHub" data-robot-react="hero:social"
              aria-label="GitHub profile"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            
            <a
              href="https://www.linkedin.com/in/sunny-pasumarthi-357615333/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center hover:bg-[#FF5A1F] hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="LinkedIn" data-robot-react="hero:social"
              aria-label="LinkedIn profile"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            <a
              href="https://instagram.com/sunny_pasumarthi"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center hover:bg-[#FF5A1F] hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Instagram" data-robot-react="hero:social"
              aria-label="Instagram profile"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <a
              href={`mailto:${CONTACT_INFO.email}?subject=Hello%20Sunny`}
              className="w-10 h-10 border-2 border-[#0A0A0A] bg-white text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center hover:bg-[#FF5A1F] hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Email" data-robot-react="hero:social"
              aria-label="Send direct email"
            >
              <Mail size={16} />
            </a>
          </div>

        </div>

        {/* Right Column: Contained 3D Visual Stage with Plinth, Architectural Panels and Robots */}
        <div 
          data-robot-anchor="home:platform" 
          data-robot-offset-x="0" 
          data-robot-offset-y="0" 
          className="w-full lg:col-span-5 h-[380px] sm:h-[440px] lg:h-[480px] max-w-[500px] mx-auto relative flex items-center justify-center pointer-events-auto"
        >
          <HeroIllustration isHeroInView={isHeroInView} />
        </div>

      </div>

      {/* DOM Hit-Area Button for Clicking BOLT (independent of pointer-events: none canvas) */}
      {boltScreen.visible && boltScreen.x > 0 && (
        <button
          onClick={() => {
            const current = robotStore.getState().boltAnim;
            robotStore.setBolt(current === 'jump' ? 'idle' : 'jump', 'excited');
          }}
          aria-label="Interact with Bolt Robot"
          style={{
            position: 'fixed',
            left: `${boltScreen.x - 45}px`,
            top: `${boltScreen.y - 65}px`,
            width: '90px',
            height: '130px',
            cursor: 'pointer',
            zIndex: 30,
            background: 'transparent',
            border: 'none',
            outline: 'none',
          }}
          className="focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
        />
      )}

      {/* On-screen debug readout if ?robotDebug=1 is present */}
      <RobotDebugOverlay />
    </section>
  );
};

export default Hero;
