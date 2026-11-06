import { robotStore } from '../robot/robotStore';
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ArrowRight, X, Code, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projectsData, type ProjectCaseStudy } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

export const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop horizontal pin scrub
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isMobile) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      const scrollTween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(
              projectsData.length,
              Math.max(1, Math.round(self.progress * (projectsData.length - 1)) + 1)
            );
            setActiveIndex(index);
          },
        },
      });

      return () => {
        scrollTween.kill();
      };
    }, container);

    return () => ctx.revert();
  }, [isMobile]);

  // Mobile reveal animations
  useEffect(() => {
    if (!isMobile) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [isMobile]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section 
      id="work" 
      ref={containerRef}
      className={`w-full relative z-10 bg-white text-[#0A0A0A] border-b-2 border-[#0A0A0A] scroll-mt-24 sm:scroll-mt-28 ${
        isMobile ? 'py-16' : 'h-screen max-h-screen overflow-hidden flex flex-col justify-center py-6'
      }`}
    >
      {/* Section Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-6 shrink-0">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div data-robot-anchor="work:header" data-robot-offset-x="-50" data-robot-offset-y="-20" className="flex items-center gap-3 flex-grow">
            <span className="font-mono text-xs font-bold px-3 py-1 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A]">
              03 // WORK
            </span>
            <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          </div>

          {/* Project Index Counter */}
          <div className="px-3 py-1 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] font-mono text-xs font-bold shrink-0">
            0{activeIndex} / 0{projectsData.length}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#0A0A0A] leading-none">
              FEATURED PROJECTS
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/70 mt-1.5">
              Web applications and prototypes I have built.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Track (Desktop) / Vertical Stack (Mobile) */}
      <div className={`w-full ${isMobile ? 'px-4 sm:px-6' : 'overflow-hidden shrink-0'}`}>
        <div 
          ref={trackRef}
          className={`${
            isMobile 
              ? 'flex flex-col gap-8 max-w-xl mx-auto' 
              : 'flex gap-8 will-change-transform'
          }`}
          style={
            !isMobile
              ? {
                  paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))',
                  paddingRight: 'max(4rem, calc((100vw - 80rem) / 2 + 8rem))',
                }
              : undefined
          }
        >
          {projectsData.map((project, idx) => (
            <div
              key={project.id}
              ref={(el) => { cardsRef.current[idx] = el; }}
              onClick={() => setSelectedProject(project)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                robotStore.setWorkCardHover({
                  id: project.id,
                  isTodoScreenshot: Boolean(project.isTodoScreenshot),
                  screenX: rect.left + rect.width / 2,
                  screenY: rect.top,
                });
              }}
              onMouseLeave={() => {
                robotStore.setWorkCardHover(null);
              }}
              className={`flex-shrink-0 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] hover:shadow-[10px_10px_0px_#0047AB] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                isMobile 
                  ? 'w-full min-h-[460px]' 
                  : 'w-[min(560px,82vw)] h-[min(640px,calc(100vh-220px))]'
              }`}
            >
              {/* Card Top / Image Area with fixed aspect ratio */}
              <div className="w-full aspect-[16/9] border-b-2 border-[#0A0A0A] bg-[#0047AB] relative overflow-hidden shrink-0 flex items-center justify-center">
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

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow gap-3">
                <div className="flex flex-col gap-2">
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

                  {/* Clamped to exactly 3 lines */}
                  <p className="text-xs sm:text-sm text-[#0A0A0A]/80 leading-relaxed font-sans line-clamp-3">
                    {project.oneLiner}
                  </p>
                </div>

                {/* Stack Pills */}
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

                {/* Card Action Footer */}
                <div className="pt-3 border-t-2 border-[#0A0A0A]/10 flex items-center justify-between font-mono text-xs font-bold mt-auto">
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
                </div>
              </div>
            </div>
          ))}
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

              {/* 3. Technical Decisions */}
              <div>
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#0A0A0A] mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#0A1A3F] border border-[#0A0A0A]" />
                  03. Key Technical Decisions
                </h4>
                <div className="grid grid-cols-1 gap-3 font-sans">
                  {selectedProject.caseStudy.decisions.map((dec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-[#EEF2FA] border border-[#0A0A0A]">
                      <CheckCircle2 size={16} className="text-[#0047AB] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#0A0A0A]/90 font-medium">{dec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Technical Stack Details */}
              <div>
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight text-[#0A0A0A] mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
                  04. Technical Architecture
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {selectedProject.caseStudy.stackDetails.map((item, i) => (
                    <div key={i} className="p-3 bg-white border-2 border-[#0A0A0A] font-semibold text-[#0A0A0A]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Outcome */}
              <div className="bg-[#0047AB] text-white p-6 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
                <h4 className="font-display font-extrabold text-lg uppercase tracking-tight mb-2 text-[#FF5A1F]">
                  05. Outcome & Impact
                </h4>
                <p className="text-sm sm:text-base leading-relaxed font-sans text-white">
                  {selectedProject.caseStudy.outcome}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t-2 border-[#0A0A0A] flex flex-wrap gap-4 font-mono text-xs font-bold">
                {selectedProject.links.live && (
                  <a
                    href={selectedProject.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-black hover:text-white transition-colors"
                  >
                    <span>OPEN LIVE SITE</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                {selectedProject.links.github && (
                  <a
                    href={selectedProject.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#EEF2FA] transition-colors"
                  >
                    <span>VIEW SOURCE REPOSITORY</span>
                    <Code size={14} />
                  </a>
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
