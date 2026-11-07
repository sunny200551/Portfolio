import React, { useState, useEffect, useRef } from 'react';
import { Award, Building, Calendar, MapPin, ExternalLink, CheckCircle2, ShieldCheck, Sparkles, ChevronUp, Plus, ArrowDown } from 'lucide-react';
import { internshipsData } from '../data/internships';
import { steveVoice } from '../robot/steveVoice';
import { CONTACT_INFO } from '../data/contact';

// Accordion configuration: single row open at a time by default
const ALLOW_MULTIPLE_ACCORDION = false;

export const Internship: React.FC = () => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set<string>());
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const ongoingInternships = internshipsData.filter((i) => i.status === 'ongoing');
  const completedInternships = internshipsData
    .filter((i) => i.status === 'completed')
    .sort((a, b) => (b.end > a.end ? 1 : -1));

  // Check reduced motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Deep linking: expand matching accordion row if URL hash is #internship-<id>
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#internship-')) {
        const targetId = hash.replace('#internship-', '');
        setExpandedIds((prev) => {
          const next = ALLOW_MULTIPLE_ACCORDION ? new Set(prev) : new Set<string>();
          next.add(targetId);
          return next;
        });

        // Scroll matching row into view
        setTimeout(() => {
          const el = accordionRefs.current[targetId];
          if (el) {
            el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
          }
        }, 150);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [prefersReducedMotion]);

  // Toggle accordion row
  const toggleAccordion = (id: string) => {
    setExpandedIds((prev) => {
      const next = ALLOW_MULTIPLE_ACCORDION ? new Set(prev) : new Set<string>();
      const isCurrentlyOpen = prev.has(id);
      if (isCurrentlyOpen) {
        next.delete(id);
      } else {
        next.add(id);
        // Steve nods on expand
        window.dispatchEvent(new CustomEvent('robot:action', { detail: 'nod' }));
      }
      return next;
    });
  };

  // Ongoing badge hover: Steve inspects with magnifying glass
  const handleOngoingMouseEnter = (id: string) => {
    setHoveredBadge(id);
    steveVoice.speak('internship_ongoing_hover');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'inspect' }));
  };

  const handleOngoingMouseLeave = () => {
    setHoveredBadge(null);
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'idle' }));
  };

  // Polylance link: Steve points at it
  const handlePolylanceMouseEnter = () => {
    steveVoice.speak('internship_polylance_hover');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'point' }));
  };

  const handlePolylanceClick = () => {
    steveVoice.speak('internship_polylance_click');
  };

  // Completed row hover: Steve points
  const handleCompletedRowMouseEnter = () => {
    steveVoice.speak('internship_completed_hover');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'point' }));
  };

  const handleCompletedRowMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'idle' }));
  };

  // Certificate button or thumbnail click: Steve gives thumbs up
  const handleCertificateClick = () => {
    steveVoice.speak('internship_cert_click');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'thumbsup' }));
  };

  // LostLink cross-link click to Work gallery
  const handleLostLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.history.pushState(null, '', '#project-foundify-datavalley');
    window.dispatchEvent(new CustomEvent('work:go-to-project', { detail: 'foundify-datavalley' }));
    
    const workEl = document.getElementById('work');
    if (workEl) {
      workEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="internship" 
      className="w-full bg-[#FAFAFA] text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A] overflow-hidden scroll-mt-20"
    >
      <div className="py-16 md:py-24 lane-padded w-full max-w-[2200px] mx-auto">
        
        {/* Section Header */}
        <div
          data-robot-anchor="internship:heading"
          data-robot-offset-x="-50"
          data-robot-offset-y="-20"
          className="flex items-center gap-3 mb-8"
        >
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            05 // INTERNSHIP
          </span>
          <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
          <span className="font-mono text-xs font-bold text-[#FF5C00]">
            INDUSTRY APPRENTICESHIP
          </span>
        </div>

        <div className="mb-12">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter text-[#0A0A0A] leading-none">
            WORK & APPRENTICESHIP
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#0A0A0A]/80 max-w-2xl leading-relaxed mt-3">
            Where I&apos;m building right now.
          </p>
        </div>

        {/* ================================================================= */}
        {/* PART 2 & PART 4: ONGOING ROLE (Big ID Badge Design + Holder Name) */}
        {/* ================================================================= */}
        {ongoingInternships.length > 0 && (
          <div className="mb-16">
            {/* Divider row above ongoing badge */}
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-xs font-black px-3 py-1 bg-[#FF5C00] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-[#0A0A0A] animate-pulse inline-block" />
                CURRENTLY CONTRIBUTING
              </span>
              <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
            </div>

            <div className="flex flex-col gap-12">
              {ongoingInternships.map((item) => (
                <div
                  key={item.id}
                  className="relative max-w-5xl mx-auto w-full group"
                  onMouseEnter={() => handleOngoingMouseEnter(item.id)}
                  onMouseLeave={handleOngoingMouseLeave}
                >
                  {/* Lanyard Top Strap & Metallic Clip */}
                  <div className="flex flex-col items-center justify-center w-full relative z-20 -mb-3 pointer-events-none">
                    <div className="w-8 h-12 bg-[#0047AB] border-2 border-[#0A0A0A] shadow-[2px_0px_0px_#0A0A0A]" />
                    <div className="w-12 h-5 bg-[#D9D9D9] border-2 border-[#0A0A0A] rounded-t-sm shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center">
                      <div className="w-4 h-1.5 bg-[#888] rounded-full" />
                    </div>
                    <div className="w-6 h-6 border-2 border-[#0A0A0A] bg-[#B5B5B5] rotate-45 -mt-2 shadow-[2px_2px_0px_#0A0A0A]" />
                  </div>

                  {/* ID Badge Card with Spring Swing on Hover */}
                  <div
                    className={`relative bg-white border-3 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] transition-transform duration-500 ease-out origin-top ${
                      hoveredBadge === item.id ? 'rotate-1 -translate-y-1' : ''
                    }`}
                  >
                    {/* Lanyard Slot Hole Punch */}
                    <div className="w-16 h-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] rounded-full mx-auto mt-4 mb-3" />

                    {/* ======================================================= */}
                    {/* PART 4: ID PASS HOLDER NAME & SQUARE PHOTO BLOCK       */}
                    {/* ======================================================= */}
                    <div className="px-6 sm:px-10 py-3 bg-[#FAFAFA] border-y-2 border-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Square ID Photo with thick border & offset shadow */}
                        <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-[#0047AB] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] overflow-hidden">
                          <img
                            src="/profile.webp"
                            alt={CONTACT_INFO.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/avatar.png';
                            }}
                          />
                        </div>

                        {/* Pass Holder Name Block */}
                        <div className="min-w-0">
                          <span className="font-mono text-[9px] font-black text-[#0A0A0A]/60 uppercase tracking-widest block">
                            SECURITY ID PASS // HOLDER NAME
                          </span>
                          <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tighter text-[#0A0A0A] leading-none mt-0.5 truncate">
                            {CONTACT_INFO.name.toUpperCase()}
                          </h3>
                        </div>
                      </div>

                      {/* Status Stamp */}
                      <div className="self-start sm:self-center shrink-0 font-mono text-xs font-black uppercase px-3 py-1.5 bg-[#FF5C00] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transform -rotate-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#0A0A0A] animate-ping" />
                        <span>{item.statusLabel}</span>
                      </div>
                    </div>

                    {/* Badge Main Grid */}
                    <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left Column: Badge Identity & Status */}
                      <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
                        <div>
                          {/* Mode Chip */}
                          <div className="flex items-center gap-4 mb-4">
                            <span className="font-mono text-[11px] font-bold px-2.5 py-1 bg-[#EEF2FA] border-2 border-[#0A0A0A] uppercase flex items-center gap-1.5">
                              <Building size={13} className="text-[#0047AB]" />
                              {item.mode.toUpperCase()}
                            </span>
                          </div>

                          {/* Role Title */}
                          <h4 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#0A0A0A] leading-tight">
                            {item.role.toUpperCase()}
                          </h4>

                          {/* Company with Link */}
                          <div className="mt-2">
                            {item.companyUrl ? (
                              <a
                                href={item.companyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={handlePolylanceMouseEnter}
                                onClick={handlePolylanceClick}
                                className="inline-flex items-center gap-1.5 font-mono font-black text-lg text-[#0047AB] uppercase hover:text-[#FF5C00] hover:underline transition-colors"
                              >
                                <span>{item.company.toUpperCase()}</span>
                                <ExternalLink size={16} />
                              </a>
                            ) : (
                              <h5 className="font-mono font-extrabold text-lg text-[#0047AB] uppercase">
                                {item.company.toUpperCase()}
                              </h5>
                            )}
                          </div>

                          {/* Period & Location Line */}
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#0A0A0A]/80 font-bold mt-4 pt-4 border-t-2 border-[#0A0A0A]/10">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-[#FF5C00]" />
                              {item.periodLabel}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#0047AB]" />
                              {item.modeAndLocation}
                            </span>
                          </div>

                          {/* Summary */}
                          <p className="font-sans text-sm sm:text-base text-[#0A0A0A]/90 leading-relaxed mt-4">
                            {item.summary}
                          </p>
                        </div>

                        {/* Barcode Strip */}
                        <div className="pt-6 border-t-2 border-[#0A0A0A]/10">
                          <div className="flex items-center justify-between font-mono text-[10px] text-[#0A0A0A]/60 font-bold uppercase mb-1">
                            <span>ID PASS</span>
                            <span>{item.barcodeCode || 'PZ-2026-04'}</span>
                          </div>
                          <div className="h-8 w-full flex items-stretch gap-[3px] bg-white border border-[#0A0A0A] p-1 overflow-hidden" aria-hidden="true">
                            {[4, 2, 6, 1, 3, 5, 2, 4, 1, 3, 6, 2, 5, 3, 1, 4, 2, 6, 3, 2, 5, 1, 4, 3, 6, 2, 4, 1, 5, 2, 6, 3, 4, 1].map((w, i) => (
                              <div
                                key={i}
                                className="bg-[#0A0A0A] flex-shrink-0"
                                style={{ width: `${w}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Key Contributions & Technology Environment */}
                      <div className="lg:col-span-7 bg-[#EEF2FA] border-2 border-[#0A0A0A] p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
                        <div>
                          <h5 className="font-display font-black text-sm uppercase text-[#0A0A0A] tracking-wider mb-4 flex items-center gap-2">
                            <Award size={16} className="text-[#FF5C00]" />
                            {item.highlightsTitle}
                          </h5>

                          <ul className="space-y-3 font-sans text-sm sm:text-base text-[#0A0A0A]/90">
                            {item.highlights.map((hl, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="w-2.5 h-2.5 bg-[#FF5C00] border border-[#0A0A0A] shrink-0 mt-1.5" aria-hidden="true" />
                                <span>{hl}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Technology Environment */}
                        <div className="pt-4 border-t-2 border-[#0A0A0A]/10">
                          <span className="font-mono text-[11px] font-bold text-[#0A0A0A]/70 uppercase block mb-2">
                            TECHNOLOGY ENVIRONMENT:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {item.tech.map((t) => (
                              <span
                                key={t}
                                className="font-mono text-xs font-bold px-2.5 py-1 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Link: VISIT POLYLANCEZENITH.COM */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {item.companyUrl && (
                            <a
                              href={item.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onMouseEnter={handlePolylanceMouseEnter}
                              onClick={handlePolylanceClick}
                              className="px-6 py-3 bg-[#FF5C00] text-black font-mono text-xs font-black uppercase border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#0047AB] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
                            >
                              <Sparkles size={15} />
                              <span>VISIT POLYLANCEZENITH.COM ↗</span>
                            </a>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PART 3: COMPLETED INTERNSHIPS (Collapsed Accordion)               */}
        {/* ================================================================= */}
        {completedInternships.length > 0 && (
          <div>
            {/* Divider row showing completed count */}
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-xs font-black px-3 py-1 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] uppercase tracking-wide">
                COMPLETED ({completedInternships.length})
              </span>
              <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
            </div>

            <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
              {completedInternships.map((item) => {
                const isOpen = expandedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    id={`internship-${item.id}`}
                    ref={(el) => { accordionRefs.current[item.id] = el; }}
                    className="border-2 border-[#0A0A0A] bg-white shadow-[4px_4px_0px_#0A0A0A] transition-all"
                  >
                    {/* Collapsed Button Row Header */}
                    <button
                      type="button"
                      id={`internship-header-${item.id}`}
                      aria-expanded={isOpen}
                      aria-controls={`internship-panel-${item.id}`}
                      onClick={() => toggleAccordion(item.id)}
                      onMouseEnter={handleCompletedRowMouseEnter}
                      onMouseLeave={handleCompletedRowMouseLeave}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 bg-white hover:bg-[#EEF2FA] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap min-w-0">
                        {/* Blue Completed Badge */}
                        <span className="font-mono text-[10px] sm:text-xs font-black px-2.5 py-1 bg-[#0047AB] text-white border border-[#0A0A0A] uppercase flex items-center gap-1.5 shrink-0 shadow-[1px_1px_0px_#0A0A0A]">
                          <ShieldCheck size={13} />
                          COMPLETED
                        </span>

                        {/* Role Title */}
                        <span className="font-display font-black text-base sm:text-lg uppercase text-[#0A0A0A] tracking-tight">
                          {item.role.toUpperCase()}
                        </span>

                        <span className="text-[#0A0A0A]/30 hidden sm:inline" aria-hidden="true">|</span>

                        {/* Company Name */}
                        <span className="font-mono font-extrabold text-xs sm:text-sm text-[#0047AB] uppercase">
                          {item.company.toUpperCase()}
                        </span>
                      </div>

                      {/* Plus / Chevron Toggle Icon */}
                      <div className="w-8 h-8 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] shrink-0 flex items-center justify-center transition-transform text-[#0A0A0A]">
                        {isOpen ? <ChevronUp size={18} /> : <Plus size={18} />}
                      </div>
                    </button>

                    {/* Expandable Details Panel */}
                    {isOpen && (
                      <div
                        id={`internship-panel-${item.id}`}
                        role="region"
                        aria-labelledby={`internship-header-${item.id}`}
                        className="border-t-2 border-[#0A0A0A] p-6 sm:p-8 bg-white animate-in fade-in duration-200"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          
                          {/* Left Column: Details & Certificate */}
                          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4">
                            <div>
                              {/* Metadata Row: Chips & Period */}
                              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-[#EEF2FA] border border-[#0A0A0A] uppercase">
                                  {item.modeAndLocation}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-[#0A0A0A]/70 flex items-center gap-1">
                                  <Calendar size={12} className="text-[#FF5C00]" />
                                  {item.periodLabel}
                                </span>
                              </div>

                              {/* Summary */}
                              <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/85 leading-relaxed mt-2">
                                {item.summary}
                              </p>
                            </div>

                            {/* Certificate Row */}
                            {item.certificate && (
                              <div className="pt-4 border-t-2 border-[#0A0A0A]/10 flex flex-col sm:flex-row sm:items-center gap-4 bg-[#EEF2FA] p-3.5 border border-[#0A0A0A]">
                                {/* Certificate Thumbnail with Tilt */}
                                <a
                                  href={item.certificate.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={handleCertificateClick}
                                  className="shrink-0 group block"
                                  title="Open certificate in new tab"
                                >
                                  <img
                                    src={item.certificate.thumbnailUrl}
                                    alt={item.certificate.alt}
                                    className="w-24 sm:w-28 h-auto border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] -rotate-1 group-hover:rotate-0 group-hover:scale-105 transition-transform bg-white"
                                  />
                                </a>

                                <div className="flex flex-col justify-between gap-2.5 flex-grow">
                                  <div className="flex items-center gap-1.5 font-mono text-xs font-black text-[#0047AB] uppercase">
                                    <CheckCircle2 size={15} className="text-[#0047AB]" />
                                    <span>{item.certificate.label}</span>
                                  </div>
                                  <p className="font-mono text-[11px] text-[#0A0A0A]/70">
                                    Issued by Datavalley &amp; APSCHE (Reg: 23KB1A05G0).
                                  </p>
                                  <div>
                                    <a
                                      href={item.certificate.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={handleCertificateClick}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0047AB] text-white font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all"
                                    >
                                      <span>VIEW CERTIFICATE ↗</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Highlights & Technology Chips */}
                          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4">
                            <div>
                              <h5 className="font-display font-black text-xs uppercase text-[#0A0A0A] tracking-wider mb-3 flex items-center gap-1.5">
                                <Award size={14} className="text-[#FF5C00]" />
                                {item.highlightsTitle}
                              </h5>

                              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#0A0A0A]/90">
                                {item.highlights.map((hl, idx) => {
                                  // Highlight with inline LostLink internal scroll link
                                  if (hl.includes('LostLink')) {
                                    return (
                                      <li key={idx} className="flex items-start gap-2.5">
                                        <span className="w-2 h-2 bg-[#0047AB] border border-[#0A0A0A] shrink-0 mt-1.5" aria-hidden="true" />
                                        <p className="leading-relaxed">
                                          Developed{' '}
                                          <a
                                            href="#project-foundify-datavalley"
                                            onClick={handleLostLinkClick}
                                            className="font-bold text-[#0047AB] underline hover:text-[#FF5C00] transition-colors cursor-pointer inline-flex items-center gap-0.5"
                                            title="Scroll to LostLink (foundify-datavally) in Work gallery"
                                          >
                                            <span>LostLink</span>
                                            <ArrowDown size={11} className="inline-block" />
                                          </a>
                                          {' '}(listed in my portfolio projects as &quot;foundify-datavally&quot;), a lost and found mobile application.
                                        </p>
                                      </li>
                                    );
                                  }

                                  return (
                                    <li key={idx} className="flex items-start gap-2.5">
                                      <span className="w-2 h-2 bg-[#0047AB] border border-[#0A0A0A] shrink-0 mt-1.5" aria-hidden="true" />
                                      <span className="leading-relaxed">{hl}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>

                            {/* Technology Chips */}
                            <div className="pt-3 border-t-2 border-[#0A0A0A]/10">
                              <span className="font-mono text-[10px] font-bold text-[#0A0A0A]/70 uppercase block mb-1.5">
                                TECHNOLOGY ENVIRONMENT:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {item.tech.map((t) => (
                                  <span
                                    key={t}
                                    className="font-mono text-[11px] font-bold px-2 py-0.5 bg-[#EEF2FA] border border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Internship;
