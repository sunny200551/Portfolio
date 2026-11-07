import React, { useState } from 'react';
import { Award, Building, Calendar, MapPin, ExternalLink, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { internshipsData } from '../data/internships';
import { steveVoice } from '../robot/steveVoice';

export const Internship: React.FC = () => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const ongoingInternships = internshipsData.filter((i) => i.status === 'ongoing');
  const completedInternships = internshipsData
    .filter((i) => i.status === 'completed')
    .sort((a, b) => (b.end > a.end ? 1 : -1));

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

  // Completed card hover: Steve nods
  const handleCompletedMouseEnter = () => {
    steveVoice.speak('internship_completed_hover');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'nod' }));
  };

  const handleCompletedMouseLeave = () => {
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
    window.history.pushState(null, '', '#project-foundify-datavalley');
    window.dispatchEvent(new CustomEvent('work:go-to-project', { detail: 'foundify-datavalley' }));
    
    // Also scroll smoothly to #work if needed
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
        {/* PART 2: ONGOING ROLE (Big ID Badge Design)                        */}
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
                    <div className="w-16 h-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] rounded-full mx-auto mt-4" />

                    {/* Badge Main Grid */}
                    <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left Column: Badge Identity & Status */}
                      <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
                        <div>
                          {/* Status Stamp & Mode Chip */}
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <span className="font-mono text-[11px] font-bold px-2.5 py-1 bg-[#EEF2FA] border-2 border-[#0A0A0A] uppercase flex items-center gap-1.5">
                              <Building size={13} className="text-[#0047AB]" />
                              {item.mode.toUpperCase()}
                            </span>

                            <div className="font-mono text-xs font-black uppercase px-3 py-1 bg-[#FF5C00] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transform -rotate-2 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#0A0A0A] animate-ping" />
                              <span>{item.statusLabel}</span>
                            </div>
                          </div>

                          {/* Role Title */}
                          <h3 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#0A0A0A] leading-tight">
                            {item.role.toUpperCase()}
                          </h3>

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
                              <h4 className="font-mono font-extrabold text-lg text-[#0047AB] uppercase">
                                {item.company.toUpperCase()}
                              </h4>
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
                          <h4 className="font-display font-black text-sm uppercase text-[#0A0A0A] tracking-wider mb-4 flex items-center gap-2">
                            <Award size={16} className="text-[#FF5C00]" />
                            {item.highlightsTitle}
                          </h4>

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
        {/* PART 3 & 4: COMPLETED INTERNSHIP (Compact Card & Certificate)     */}
        {/* ================================================================= */}
        {completedInternships.length > 0 && (
          <div>
            {/* Divider row between sections */}
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-xs font-bold px-3 py-1 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] uppercase">
                COMPLETED
              </span>
              <div className="h-0.5 flex-grow bg-[#0A0A0A]" />
            </div>

            <div className="flex flex-col gap-8">
              {completedInternships.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={handleCompletedMouseEnter}
                  onMouseLeave={handleCompletedMouseLeave}
                  className="max-w-5xl mx-auto w-full bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] hover:shadow-[10px_10px_0px_#0047AB] transition-all p-6 sm:p-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Details */}
                    <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4">
                      <div>
                        {/* Header Row: Chips & Period */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                          <span className="font-mono text-[10px] font-black px-2.5 py-1 bg-[#0047AB] text-white border-2 border-[#0A0A0A] uppercase flex items-center gap-1">
                            <ShieldCheck size={12} />
                            COMPLETED
                          </span>
                          <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-[#EEF2FA] border-2 border-[#0A0A0A] uppercase">
                            {item.modeAndLocation}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-[#0A0A0A]/70 flex items-center gap-1">
                            <Calendar size={12} className="text-[#FF5C00]" />
                            {item.periodLabel}
                          </span>
                        </div>

                        {/* Role & Company */}
                        <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#0A0A0A] leading-tight">
                          {item.role.toUpperCase()}
                        </h3>
                        <h4 className="font-mono font-extrabold text-sm text-[#0047AB] uppercase mt-1">
                          {item.company.toUpperCase()}
                        </h4>

                        {/* Summary */}
                        <p className="font-sans text-xs sm:text-sm text-[#0A0A0A]/85 leading-relaxed mt-3">
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
                              Issued by Datavalley & APSCHE (Reg: 23KB1A05G0).
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
                        <h4 className="font-display font-black text-xs uppercase text-[#0A0A0A] tracking-wider mb-3 flex items-center gap-1.5">
                          <Award size={14} className="text-[#FF5C00]" />
                          {item.highlightsTitle}
                        </h4>

                        <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#0A0A0A]/90">
                          {item.highlights.map((hl, idx) => {
                            // Check if this highlight mentions LostLink / foundify-datavally
                            if (hl.includes('LostLink')) {
                              return (
                                <li key={idx} className="flex items-start gap-2.5">
                                  <span className="w-2 h-2 bg-[#0047AB] border border-[#0A0A0A] shrink-0 mt-1.5" aria-hidden="true" />
                                  <span>
                                    Developed{' '}
                                    <a
                                      href="#project-foundify-datavalley"
                                      onClick={handleLostLinkClick}
                                      className="font-bold text-[#0047AB] underline hover:text-[#FF5C00] transition-colors cursor-pointer inline-flex items-center gap-1"
                                      title="Jump to LostLink / Foundify-DataValley in Work gallery"
                                    >
                                      <span>LostLink (listed in my portfolio projects as &quot;foundify-datavally&quot;)</span>
                                      <ExternalLink size={12} />
                                    </a>
                                    , a lost and found mobile application.
                                  </span>
                                </li>
                              );
                            }

                            return (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span className="w-2 h-2 bg-[#0047AB] border border-[#0A0A0A] shrink-0 mt-1.5" aria-hidden="true" />
                                <span>{hl}</span>
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
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Internship;
