import React, { useState } from 'react';
import { Award, Building, Calendar, MapPin, Clock } from 'lucide-react';
import { internshipsData } from '../data/internships';
import { steveVoice } from '../robot/steveVoice';

export const Internship: React.FC = () => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const handleBadgeHover = (id: string) => {
    setHoveredBadge(id);
    steveVoice.speak('internship_badge_hover');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'inspect' }));
  };

  const handleBadgeLeave = () => {
    setHoveredBadge(null);
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'idle' }));
  };

  const handleCertificateClick = () => {
    steveVoice.speak('internship_cert_click');
    window.dispatchEvent(new CustomEvent('robot:action', { detail: 'thumbsup' }));
  };

  return (
    <section id="internship" className="w-full bg-[#FAFAFA] text-[#0A0A0A] relative z-10 border-b-2 border-[#0A0A0A] overflow-hidden">
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
            Real-world industry experience, professional software engineering practices, and engineering problem-solving.
          </p>
        </div>

        {/* Badges Container */}
        <div className="flex flex-col gap-12">
          {internshipsData.map((item) => (
            <div
              key={item.id}
              className="relative max-w-5xl mx-auto w-full group"
              onMouseEnter={() => handleBadgeHover(item.id)}
              onMouseLeave={handleBadgeLeave}
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

                {/* Placeholder Ribbon if applicable */}
                {item.isPlaceholder && (
                  <div className="bg-[#FF5C00] text-black font-mono font-black text-xs uppercase py-1.5 px-4 text-center border-b-2 border-t-2 border-[#0A0A0A] tracking-wider mt-3">
                    ⚠ REPLACE IN src/data/internships.ts (INTERNSHIP PLACEHOLDER)
                  </div>
                )}

                {/* Badge Main Grid */}
                <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Badge Identity & Status */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
                    <div>
                      {/* Status Stamp */}
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="font-mono text-[11px] font-bold px-2.5 py-1 bg-[#EEF2FA] border-2 border-[#0A0A0A] uppercase flex items-center gap-1.5">
                          <Building size={13} className="text-[#0047AB]" />
                          {item.mode.toUpperCase()}
                        </span>

                        <div
                          className={`font-mono text-xs font-black uppercase px-3 py-1 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transform -rotate-3 ${
                            item.status === 'completed'
                              ? 'bg-[#0047AB] text-white'
                              : 'bg-[#FF5C00] text-black'
                          }`}
                        >
                          {item.status === 'completed' ? '✓ COMPLETED' : '● ONGOING'}
                        </div>
                      </div>

                      {/* Role & Company */}
                      <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#0A0A0A] leading-tight">
                        {item.role}
                      </h3>
                      <h4 className="font-mono font-extrabold text-base text-[#0047AB] uppercase mt-1">
                        {item.company}
                      </h4>

                      {/* Period & Location */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#0A0A0A]/70 font-bold mt-4 pt-4 border-t-2 border-[#0A0A0A]/10">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#FF5C00]" />
                          {item.start} — {item.end}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#0047AB]" />
                          {item.location}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="font-sans text-sm sm:text-base text-[#0A0A0A]/85 leading-relaxed mt-4">
                        {item.summary}
                      </p>
                    </div>

                    {/* Barcode Strip */}
                    <div className="pt-6 border-t-2 border-[#0A0A0A]/10">
                      <div className="flex items-center justify-between font-mono text-[10px] text-[#0A0A0A]/60 font-bold uppercase mb-1">
                        <span>SECURITY ID PASS</span>
                        <span>SP-INT-{item.start.replace(/\s+/g, '')}-001</span>
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

                  {/* Right Column: Highlights & Tech Stack */}
                  <div className="lg:col-span-7 bg-[#EEF2FA] border-2 border-[#0A0A0A] p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
                    <div>
                      <h4 className="font-display font-black text-sm uppercase text-[#0A0A0A] tracking-wider mb-4 flex items-center gap-2">
                        <Award size={16} className="text-[#FF5C00]" />
                        KEY APPRENTICESHIP HIGHLIGHTS
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

                    {/* Tech Chips */}
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

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {item.certificateUrl ? (
                        <a
                          data-robot-react="internship:cert"
                          href={item.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleCertificateClick}
                          className="px-5 py-2.5 bg-[#0047AB] text-white font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
                        >
                          <Award size={14} />
                          <span>CERTIFICATE ↗</span>
                        </a>
                      ) : (
                        <div className="px-4 py-2 bg-white/70 text-[#0A0A0A]/60 font-mono text-xs font-bold uppercase border-2 border-dashed border-[#0A0A0A] flex items-center gap-2">
                          <Clock size={13} />
                          <span>CERTIFICATE: IN PROGRESS</span>
                        </div>
                      )}

                      {item.companyUrl && (
                        <a
                          href={item.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-white text-[#0A0A0A] font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
                        >
                          <Building size={14} />
                          <span>COMPANY ↗</span>
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
    </section>
  );
};

export default Internship;
