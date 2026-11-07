import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { ExternalLink, ArrowRight, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projectsData, type ProjectCaseStudy } from '../data/projects';
import { robotStore } from '../robot/robotStore';
import { steveVoice } from '../robot/steveVoice';
import { getLenis } from '../lib/lenis';

gsap.registerPlugin(ScrollTrigger);

export const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const [scrubProgress, setScrubProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPinnedEnabled, setIsPinnedEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024 && window.innerHeight >= 740;
  });

  // Responsive pinning detection
  useEffect(() => {
    const handleResize = () => {
      const enabled = window.innerWidth >= 1024 && window.innerHeight >= 740;
      setIsPinnedEnabled(enabled);
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop horizontal pin scrub
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !isPinnedEnabled) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 40);

      const scrollTween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${Math.max(window.innerHeight * 1.5, track.scrollWidth - window.innerWidth + 80)}`,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrubProgress(self.progress);
            const rawIndex = Math.round(self.progress * (projectsData.length - 1)) + 1;
            const index = Math.min(projectsData.length, Math.max(1, rawIndex));
            setActiveIndex(index);

            // Card scale and image parallax
            cardsRef.current.forEach((card, idx) => {
              if (!card) return;
              const dist = Math.abs(idx + 1 - index);
              const scale = dist === 0 ? 1.0 : Math.max(0.95, 1.0 - dist * 0.04);
              const opacity = dist === 0 ? 1.0 : Math.max(0.75, 1.0 - dist * 0.15);
              card.style.transform = `scale(${scale})`;
              card.style.opacity = `${opacity}`;
            });
          },
        },
      });

      return () => {
        scrollTween.kill();
      };
    }, container);

    return () => ctx.revert();
  }, [isPinnedEnabled]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProject) {
        if (e.key === 'Escape') setSelectedProject(null);
        return;
      }

      if (!isPinnedEnabled) return;

      const lenis = getLenis();
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const inWorkSection = containerRect.top <= 100 && containerRect.bottom >= 100;

      if (!inWorkSection) return;

      if (e.key === 'ArrowRight') {
        const nextIdx = Math.min(projectsData.length, activeIndex + 1);
        if (nextIdx !== activeIndex && lenis) {
          lenis.scrollTo(window.scrollY + window.innerHeight * 0.35);
        }
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = Math.max(1, activeIndex - 1);
        if (prevIdx !== activeIndex && lenis) {
          lenis.scrollTo(window.scrollY - window.innerHeight * 0.35);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, activeIndex, isPinnedEnabled]);

  const handleCardMouseEnter = useCallback(() => {
    steveVoice.speak('card_hover');
    robotStore.setSteve('idle', 'curious');
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    robotStore.setSteve('idle', 'happy');
  }, []);

  return (
    <section 
      id="work" 
      ref={containerRef}
      className={`w-full relative z-10 bg-white text-[#0A0A0A] border-b-2 border-[#0A0A0A] scroll-mt-24 sm:scroll-mt-28 ${
        !isPinnedEnabled ? 'py-16 sm:py-24' : 'h-screen max-h-screen overflow-hidden flex flex-col justify-between py-6'
      }`}
    >
      {/* Section Header */}
      <div className="w-full max-w-[2200px] mx-auto lane-padded shrink-0 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4 mb-2 sm:mb-3">
          <div className="flex items-center gap-3 flex-grow">
            <span className="font-mono text-xs font-bold px-3 py-1 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A]">
              03 // WORK
            </span>
            <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          </div>

          {/* Scrub Progress Bar + Index Badge */}
          <div className="flex items-center gap-3 shrink-0">
            {isPinnedEnabled && (
              <div 
                className="w-24 sm:w-36 h-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] overflow-hidden hidden sm:block shadow-[2px_2px_0px_#0A0A0A]"
                role="progressbar"
                aria-valuenow={Math.round(scrubProgress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div 
                  ref={progressBarRef}
                  className="h-full bg-[#FF5A1F] transition-all duration-75"
                  style={{ width: `${Math.round(scrubProgress * 100)}%` }}
                />
              </div>
            )}
            <div className="px-3 py-1 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] font-mono text-xs font-bold">
              0{activeIndex} / 0{projectsData.length}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#0A0A0A] leading-none">
              FEATURED PROJECTS
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-1">
              Web applications and prototypes I have built.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Track: Full bleed desktop scrub OR native touch horizontal swipe on smaller viewports */}
      <div className="w-full flex-grow flex items-center overflow-visible">
        <div 
          ref={trackRef}
          className={`${
            !isPinnedEnabled 
              ? 'flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 px-4 sm:px-8 w-full no-scrollbar' 
              : 'flex gap-8 will-change-transform items-center'
          }`}
          style={
            isPinnedEnabled
              ? {
                  paddingLeft: 'calc(clamp(72px, 5.5vw, 112px) + 16px)',
                  paddingRight: 'calc(clamp(72px, 5.5vw, 112px) + 64px)',
                }
              : undefined
          }
        >
          {projectsData.map((project, idx) => {
            const isInsideProject = project.id === 'portfolio';

            return (
              <div
                key={project.id}
                ref={(el) => { cardsRef.current[idx] = el; }}
                onClick={() => setSelectedProject(project)}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
                className={`flex-shrink-0 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] hover:shadow-[10px_10px_0px_#0047AB] hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
                  !isPinnedEnabled
                    ? 'snap-center w-[85vw] max-w-[480px] h-[540px]'
                    : 'w-[clamp(340px,42vw,760px)] h-[clamp(520px,calc(100vh-170px),680px)]'
                }`}
              >
                {/* 1. Card Top / Image Area: 38% height */}
                <div className="w-full h-[38%] min-h-[170px] max-h-[260px] border-b-2 border-[#0A0A0A] bg-[#0047AB] relative overflow-hidden shrink-0 flex items-center justify-center">
                  {project.imagePath ? (
                    <img
                      src={project.imagePath}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0047AB] text-white">
                      <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
                        {project.name}
                      </h3>
                      <span className="font-mono text-xs text-white/80 mt-1">
                        {project.stack.slice(0, 3).join(' • ')}
                      </span>
                    </div>
                  )}

                  {/* Index badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#0A0A0A] text-white border border-white font-mono text-xs font-bold">
                    0{idx + 1}
                  </div>
                </div>

                {/* 2. Card Body: flex-grow with min-h-0 so content never clips */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow min-h-0 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#0047AB] uppercase">
                        {project.role}
                      </span>
                      <span className="font-mono text-xs text-[#0A0A0A]/50">
                        {project.timeline}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#0A0A0A]">
                      {project.name}
                    </h3>

                    {/* Description: Clamped safely to 3 lines */}
                    <p className="text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed font-sans line-clamp-3">
                      {project.oneLiner}
                    </p>
                  </div>

                  {/* Stack Pills: Clean wrapping */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.stack.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono py-0.5 px-2 bg-[#EEF2FA] text-[#0A0A0A] border border-[#0A0A0A] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 3. Action Footer: fully visible with zero overflow */}
                  <div className="pt-3 border-t-2 border-[#0A0A0A]/10 flex items-center justify-between font-mono text-xs font-bold mt-auto w-full shrink-0">
                    {isInsideProject ? (
                      <div className="w-full flex flex-col items-center justify-center py-2 px-3 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-center select-none">
                        <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-tight">
                          YOU ARE LITERALLY INSIDE THIS PROJECT RIGHT NOW
                        </span>
                        <span className="font-mono text-[9px] font-bold text-black/80 mt-0.5">
                          (no link needed, look around)
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5 text-[#0047AB] hover:text-[#FF5A1F] transition-colors">
                          <span>VIEW CASE STUDY</span>
                          <ArrowRight size={13} />
                        </span>

                        <div className="flex items-center gap-3">
                          {project.links.live && (
                            <span className="text-[#0A0A0A] hover:text-[#FF5A1F] flex items-center gap-1">
                              LIVE <ExternalLink size={11} />
                            </span>
                          )}
                          {project.links.github && (
                            <span className="text-[#0A0A0A] hover:text-[#FF5A1F]">
                              GITHUB ↗
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Case Study Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80"
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white border-2 border-[#0A0A0A] shadow-[10px_10px_0px_#0A0A0A] flex flex-col overflow-hidden text-[#0A0A0A]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0A1A3F] text-white border-b-2 border-[#0A0A0A] font-mono">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-[#FF5A1F] border border-white" />
                <span className="font-bold text-sm uppercase tracking-wider">
                  CASE STUDY // {selectedProject.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Close Case Study"
                className="p-1.5 border border-white/40 text-white hover:bg-[#FF5A1F] hover:text-black hover:border-black cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-8 font-sans">
              
              {/* Title & One Liner */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs font-bold">
                  <span className="px-2.5 py-0.5 bg-[#FF5A1F] text-black border border-[#0A0A0A]">
                    {selectedProject.role}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#EEF2FA] text-[#0A0A0A] border border-[#0A0A0A]">
                    {selectedProject.timeline}
                  </span>
                </div>
                <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#0A0A0A]">
                  {selectedProject.name}
                </h2>
                <p className="font-mono text-sm sm:text-base text-[#0047AB] font-semibold mt-2">
                  {selectedProject.oneLiner}
                </p>
              </div>

              {/* 1. Problem Statement */}
              <div className="bg-[#EEF2FA] border-2 border-[#0A0A0A] p-6 shadow-[4px_4px_0px_#0A0A0A]">
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#0A0A0A] mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
                  01. The Problem
                </h4>
                <p className="text-sm sm:text-base text-[#0A0A0A]/90 leading-relaxed font-sans">
                  {selectedProject.caseStudy.problem}
                </p>
              </div>

              {/* 2. My Role */}
              <div className="border-2 border-[#0A0A0A] p-6 bg-white shadow-[4px_4px_0px_#0A0A0A]">
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#0A0A0A] mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#0047AB] border border-[#0A0A0A]" />
                  02. Engineering Role
                </h4>
                <p className="text-sm sm:text-base text-[#0A0A0A]/90 leading-relaxed font-sans">
                  {selectedProject.caseStudy.myRole}
                </p>
              </div>

              {/* 3. Tech Stack Deep-Dive */}
              <div>
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#0A0A0A] mb-3">
                  03. Technical Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.stack.map((item) => (
                    <span 
                      key={item}
                      className="px-3 py-1 bg-[#EEF2FA] border-2 border-[#0A0A0A] font-mono text-xs font-bold text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Architecture & Key Features */}
              <div className="space-y-4">
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#0A0A0A]">
                  04. Key Engineering Decisions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.caseStudy.decisions.map((decision, i) => (
                    <div 
                      key={i}
                      className="p-4 border-2 border-[#0A0A0A] bg-[#EEF2FA] shadow-[3px_3px_0px_#0A0A0A]"
                    >
                      <div className="font-mono text-xs font-bold text-[#FF5A1F] mb-1">
                        DECISION 0{i + 1}
                      </div>
                      <div className="text-sm text-[#0A0A0A] font-sans font-medium">
                        {decision}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Outcome & Impact */}
              <div className="bg-[#FF5A1F]/10 border-2 border-[#FF5A1F] p-6">
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#0A0A0A] mb-2">
                  05. Outcome & Results
                </h4>
                <p className="text-sm sm:text-base text-[#0A0A0A]/90 leading-relaxed font-sans">
                  {selectedProject.caseStudy.outcome}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t-2 border-[#0A0A0A] flex flex-wrap gap-4 font-mono text-xs font-bold">
                {selectedProject.id === 'portfolio' ? (
                  <div className="px-4 py-2 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                    YOU ARE EXPLORING THIS REPOSITORY RIGHT NOW
                  </div>
                ) : (
                  <>
                    {selectedProject.links.live && (
                      <a
                        href={selectedProject.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-black hover:text-white transition-all cursor-pointer"
                      >
                        <span>LAUNCH LIVE DEMO</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {selectedProject.links.github && (
                      <a
                        href={selectedProject.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#EEF2FA] transition-all cursor-pointer"
                      >
                        <span>VIEW REPOSITORY</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
