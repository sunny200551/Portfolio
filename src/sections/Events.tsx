import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Calendar, MapPin, ExternalLink, Award, X, Sparkles } from 'lucide-react';
import { getAllEvents, type EventItem, type EventType } from '../data/events';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

type FilterType = 'All' | EventType;

const typeBadgeStyles: Record<EventType, { bg: string; text: string; label: string }> = {
  hackathon: {
    bg: 'bg-[#FF5A1F]',
    text: 'text-black',
    label: 'HACKATHON'
  },
  contest: {
    bg: 'bg-[#0047AB]',
    text: 'text-white',
    label: 'CONTEST'
  },
  workshop: {
    bg: 'bg-[#0A1A3F]',
    text: 'text-white',
    label: 'WORKSHOP'
  }
};

export const Events: React.FC = () => {
  const events = useMemo(() => getAllEvents(), []);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const modalCloseRef = useRef<HTMLButtonElement>(null);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'All') return events;
    return events.filter((e) => e.type === activeFilter);
  }, [events, activeFilter]);

  // Lock body scroll and pause Lenis when modal is open
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
  }, [selectedEvent]);

  const handleOpenModal = useCallback((evt: EventItem) => {
    setSelectedEvent(evt);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  return (
    <section id="events" className="py-24 sm:py-32 bg-white relative border-b-2 border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" />
              PARTICIPATION & WORKSHOPS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-[#0A0A0A] tracking-tight">
              EVENTS & HACKATHONS
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#0A0A0A]/70 font-mono max-w-xl">
              Competitive hackathons, algorithmic contests, and technical workshops attended during my computer science journey.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] text-center">
              <span className="block text-2xl sm:text-3xl font-black font-mono text-[#0047AB]">
                {events.length}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0A0A0A]/80">
                Total Events
              </span>
            </div>
            <div className="px-5 py-3 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] text-center">
              <span className="block text-2xl sm:text-3xl font-black font-mono text-[#FF5A1F]">
                {events.filter((e) => e.type === 'hackathon').length}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0A0A0A]/80">
                Hackathons
              </span>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          /* Clean empty state for production when all entries are drafts */
          <div className="p-12 sm:p-16 border-2 border-[#0A0A0A] bg-[#EEF2FA] shadow-[6px_6px_0px_#0A0A0A] text-center max-w-2xl mx-auto">
            <Sparkles className="w-10 h-10 text-[#FF5A1F] mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-[#0A0A0A] mb-2">
              Upcoming Event Participations
            </h3>
            <p className="text-sm font-mono text-[#0A0A0A]/70 leading-relaxed">
              Active event submissions and workshop documentation will be cataloged here. Currently preparing and collaborating on upcoming hackathons.
            </p>
          </div>
        ) : (
          <>
            {/* CSS 3D Fan-out Ticket Deck */}
            <div className="mb-16 sm:mb-24 py-8">
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-[#0A0A0A]/60 mb-6 flex items-center gap-2">
                <span>FEATURED BADGES</span>
                <span className="w-8 h-px bg-[#0A0A0A]/20" />
                <span className="text-[10px] font-normal lowercase">(click badge to view details)</span>
              </div>

              {/* 3D Perspective container */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                style={{ perspective: '1200px' }}
              >
                {events.slice(0, 4).map((evt, idx) => {
                  const typeStyle = typeBadgeStyles[evt.type];
                  // Subtle stagger rotation for fan aesthetic
                  const rotZ = idx === 0 ? -2 : idx === 1 ? 1 : idx === 2 ? -1 : 2;

                  return (
                    <div
                      key={evt.slug}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${evt.name}`}
                      onClick={() => handleOpenModal(evt)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenModal(evt);
                        }
                      }}
                      style={{
                        transform: `rotateZ(${rotZ}deg)`,
                        transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 200ms ease'
                      }}
                      className="group cursor-pointer bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_#0A0A0A] hover:-translate-y-2 p-5 flex flex-col justify-between relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#FF5A1F]"
                    >
                      {/* Ticket Perforated Edge Accent */}
                      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-16px] right-[-16px] w-8 h-8 rounded-full bg-[#EEF2FA] border-2 border-[#0A0A0A]" />
                      </div>

                      {/* Header tags */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-black border border-[#0A0A0A] ${typeStyle.bg} ${typeStyle.text}`}>
                            {typeStyle.label}
                          </span>
                          {evt.draft && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#FFD700] text-black border border-[#0A0A0A]">
                              DRAFT
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-[#0A0A0A]/60 font-bold ml-auto">
                            {evt.date}
                          </span>
                        </div>

                        <h3 className="font-display font-black text-lg text-[#0A0A0A] group-hover:text-[#0047AB] transition-colors leading-tight line-clamp-2">
                          {evt.name}
                        </h3>

                        <p className="text-xs font-mono text-[#0A0A0A]/70 mt-1">
                          {evt.organizer}
                        </p>
                      </div>

                      {/* Footer info */}
                      <div className="mt-6 pt-3 border-t-2 border-dashed border-[#0A0A0A]/20 flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[#0A0A0A]">
                          Role: <span className="text-[#FF5A1F]">{evt.role}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-[#0047AB] group-hover:underline">
                          View details &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Directory Grid */}
            <div className="mt-16 pt-12 border-t-2 border-[#0A0A0A]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-[#0A0A0A]">
                    EVENT DIRECTORY
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-[#0A0A0A]/60">
                    Filter by category to explore all records.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {(['All', 'hackathon', 'contest', 'workshop'] as const).map((cat) => {
                    const isActive = activeFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 border-[#0A0A0A] transition-all ${
                          isActive
                            ? 'bg-[#FF5A1F] text-black shadow-[3px_3px_0px_#0A0A0A] -translate-y-0.5'
                            : 'bg-white text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#EEF2FA]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((evt) => {
                  const typeStyle = typeBadgeStyles[evt.type];
                  return (
                    <div
                      key={evt.slug}
                      tabIndex={0}
                      role="button"
                      onClick={() => handleOpenModal(evt)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenModal(evt);
                        }
                      }}
                      className="group cursor-pointer bg-white border-2 border-[#0A0A0A] p-6 shadow-[4px_4px_0px_#0A0A0A] hover:shadow-[6px_6px_0px_#0A0A0A] hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-[#FF5A1F]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-black border border-[#0A0A0A] ${typeStyle.bg} ${typeStyle.text}`}>
                            {typeStyle.label}
                          </span>
                          {evt.draft && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#FFD700] text-black border border-[#0A0A0A]">
                              DRAFT
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-[#0A0A0A]/60">
                          {evt.date}
                        </span>
                      </div>

                      <h4 className="text-lg font-black font-display text-[#0A0A0A] group-hover:text-[#0047AB] transition-colors leading-tight mb-2">
                        {evt.name}
                      </h4>

                      <p className="text-xs font-mono text-[#0A0A0A]/70 mb-4 line-clamp-2">
                        {evt.summary}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-[#0A0A0A]/15 text-xs font-mono">
                        <span className="text-[#0A0A0A]/60 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {evt.location}
                        </span>
                        <span className="font-bold text-[#0A1A3F] group-hover:text-[#FF5A1F] transition-colors">
                          Role: {evt.role}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Full-Screen Detail Modal Panel */}
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
          >
            {/* Close Button */}
            <button
              ref={modalCloseRef}
              onClick={handleCloseModal}
              aria-label="Close modal"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:shadow-[4px_4px_0px_#0A0A0A] transition-all focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
            >
              <X className="w-5 h-5 text-[#0A0A0A]" />
            </button>

            {/* Header info */}
            <div className="pr-12">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 text-xs font-mono font-black border border-[#0A0A0A] ${typeBadgeStyles[selectedEvent.type].bg} ${typeBadgeStyles[selectedEvent.type].text}`}>
                  {typeBadgeStyles[selectedEvent.type].label}
                </span>
                {selectedEvent.draft && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#FFD700] text-black border border-[#0A0A0A]">
                    DRAFT (Pending Review)
                  </span>
                )}
                <span className="text-xs font-mono text-[#0A0A0A]/60 font-bold ml-auto">
                  {selectedEvent.date}
                </span>
              </div>

              <h3 id="modal-event-title" className="text-2xl sm:text-3xl font-black font-display text-[#0A0A0A] leading-tight">
                {selectedEvent.name}
              </h3>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs font-mono text-[#0A0A0A]/80">
                <span>Organizer: <strong>{selectedEvent.organizer}</strong></span>
                <span>Location: <strong>{selectedEvent.location}</strong></span>
                <span>Role: <strong className="text-[#FF5A1F]">{selectedEvent.role}</strong></span>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-[#EEF2FA] border-2 border-[#0A0A0A]">
              <p className="text-sm font-mono text-[#0A0A0A] leading-relaxed">
                {selectedEvent.summary}
              </p>
            </div>

            {/* What I Built / Details */}
            {selectedEvent.whatIBuilt && selectedEvent.whatIBuilt.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#0A0A0A] mb-3">
                  What I Built / Implemented:
                </h4>
                <ul className="space-y-2">
                  {selectedEvent.whatIBuilt.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-mono text-[#0A0A0A]/90">
                      <span className="w-2 h-2 mt-1.5 bg-[#FF5A1F] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical details list */}
            {selectedEvent.details && selectedEvent.details.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#0A0A0A] mb-3">
                  Key Learnings & Execution:
                </h4>
                <ul className="space-y-2">
                  {selectedEvent.details.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-mono text-[#0A0A0A]/90">
                      <span className="w-2 h-2 mt-1.5 bg-[#0047AB] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            {selectedEvent.techStack && selectedEvent.techStack.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#0A0A0A] mb-2">
                  Tech / Focus Areas:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Outcome */}
            {selectedEvent.outcome && (
              <div className="mt-6 p-3 bg-white border-2 border-[#0A0A0A] flex items-center gap-3">
                <Award className="w-5 h-5 text-[#FF5A1F] shrink-0" />
                <span className="text-xs font-mono font-bold text-[#0A0A0A]">
                  Outcome: {selectedEvent.outcome}
                </span>
              </div>
            )}

            {/* Links */}
            {selectedEvent.links && (
              <div className="mt-8 pt-4 border-t-2 border-[#0A0A0A] flex flex-wrap gap-3">
                {selectedEvent.links.github && (
                  <a
                    href={selectedEvent.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:shadow-[4px_4px_0px_#0A0A0A] text-xs font-mono font-bold hover:bg-[#EEF2FA] transition-all"
                  >
                    <GithubIcon className="w-4 h-4" />
                    GitHub Repository
                  </a>
                )}
                {selectedEvent.links.project && (
                  <a
                    href={selectedEvent.links.project}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5A1F] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:shadow-[4px_4px_0px_#0A0A0A] text-xs font-mono font-bold transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Project Link
                  </a>
                )}
                {selectedEvent.links.certificate && (
                  <a
                    href={selectedEvent.links.certificate}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047AB] text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:shadow-[4px_4px_0px_#0A0A0A] text-xs font-mono font-bold transition-all"
                  >
                    <Award className="w-4 h-4" />
                    Certificate
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
