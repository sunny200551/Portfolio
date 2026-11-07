import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Copy, Check, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTACT_INFO } from '../data/contact';
import { SOCIAL_LINKS } from '../data/socials';
import { SittingSteve } from '../components/ui/SittingSteve';

gsap.registerPlugin(ScrollTrigger);

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const subject = encodeURIComponent("Project Inquiry via Portfolio");
  const body = encodeURIComponent(
    "Hi Sunny,\n\nI came across your portfolio and would love to discuss a project / role with you.\n\nBest regards,\n"
  );
  const mailtoUrl = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    CONTACT_INFO.email
  )}&su=${subject}&body=${body}`;
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
    CONTACT_INFO.email
  )}&subject=${subject}&body=${body}`;

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(CONTACT_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-stagger-tile',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      className="w-full bg-[#0047AB] text-white relative z-10 border-b-2 border-[#0A0A0A] overflow-hidden"
    >
      <div
        ref={containerRef}
        className="py-16 md:py-24 lane-padded w-full max-w-[2200px] mx-auto"
      >
        {/* Section Tag */}
        <div
          data-robot-anchor="contact:heading"
          data-robot-offset-x="-50"
          data-robot-offset-y="-20"
          className="flex items-center gap-3 mb-8"
        >
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]">
            11 // CONTACT
          </span>
          <div className="h-0.5 flex-grow bg-white/20" />
          <span className="font-mono text-xs font-bold text-[#FF5C00]">
            GET IN TOUCH
          </span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h2
            data-robot-anchor="contact:headline"
            className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none"
          >
            LET'S WORK TOGETHER.
          </h2>
          <p className="font-mono text-sm sm:text-base text-white/90 mt-3 font-bold tracking-wide">
            Available for software engineering opportunities, Web3 collaborations, and creator partnerships.
          </p>
        </div>

        <div className="flex flex-col gap-6 relative">
          {/* Seated Steve perched on top of Email Card */}
          <div className="absolute -top-14 right-16 sm:right-24 md:right-32 z-20 pointer-events-auto">
            <SittingSteve />
          </div>

          {/* Big Primary Tile Spanning Full Width */}
          <a
            href={mailtoUrl}
            data-robot-react="contact:copy-email"
            className="contact-stagger-tile group w-full p-6 sm:p-8 md:p-10 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_#0A0A0A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer"
          >
            <div className="flex flex-col gap-2 min-w-0">
              <span className="font-mono text-xs font-black uppercase tracking-widest text-[#0047AB] group-hover:text-black transition-colors">
                DIRECT INBOX
              </span>
              <span className="font-display font-black text-[clamp(1.4rem,3.8vw,3.25rem)] tracking-tight leading-none break-all sm:break-normal">
                {CONTACT_INFO.email}
              </span>
            </div>
            <div className="p-3.5 bg-[#EEF2FA] group-hover:bg-white text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] shrink-0 self-start sm:self-auto transition-colors">
              <ArrowUpRight size={28} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Row of Small Secondary Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open prefilled email in Gmail"
              className="px-4 py-2.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A] font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>Open in Gmail</span>
            </a>

            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open prefilled email in Outlook"
              className="px-4 py-2.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A] font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>Open in Outlook</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              data-robot-react="contact:copy-email"
              aria-label="Copy email address to clipboard"
              className="px-4 py-2.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A] font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-[#0047AB]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy address'}</span>
            </button>
          </div>

          {copied && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[#FF5C00] text-black font-mono text-xs font-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex items-center gap-2 animate-bounce select-none">
              <Check size={16} />
              <span>EMAIL COPIED TO CLIPBOARD! 📋</span>
            </div>
          )}

          {/* VERIFIED SOCIAL CHANNELS: 4 Balanced Channels (LinkedIn, GitHub, Instagram, YouTube) */}
          <div className="pt-4">
            <span className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider block mb-3">
              VERIFIED SOCIAL CHANNELS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* LinkedIn */}
              <a
                href={SOCIAL_LINKS.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LINKS.linkedin.ariaLabel}
                className="contact-stagger-tile group p-5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-display font-black text-xl tracking-tight leading-tight">
                    LINKEDIN
                  </span>
                  <span className="font-mono text-xs opacity-75 font-bold mt-0.5">
                    {SOCIAL_LINKS.linkedin.handle}
                  </span>
                </div>
                <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </a>

              {/* GitHub */}
              <a
                href={SOCIAL_LINKS.github.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LINKS.github.ariaLabel}
                className="contact-stagger-tile group p-5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-display font-black text-xl tracking-tight leading-tight">
                    GITHUB
                  </span>
                  <span className="font-mono text-xs opacity-75 font-bold mt-0.5">
                    @{SOCIAL_LINKS.github.handle}
                  </span>
                </div>
                <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </a>

              {/* Instagram */}
              <a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LINKS.instagram.ariaLabel}
                className="contact-stagger-tile group p-5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#FF5C00] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-display font-black text-xl tracking-tight leading-tight">
                    INSTAGRAM
                  </span>
                  <span className="font-mono text-xs opacity-75 font-bold mt-0.5">
                    @{SOCIAL_LINKS.instagram.handle}
                  </span>
                </div>
                <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </a>

              {/* YouTube */}
              <a
                href={SOCIAL_LINKS.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LINKS.youtube.ariaLabel}
                className="contact-stagger-tile group p-5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#FF0000] hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-display font-black text-xl tracking-tight leading-tight">
                    YOUTUBE
                  </span>
                  <span className="font-mono text-xs opacity-75 font-bold mt-0.5">
                    {SOCIAL_LINKS.youtube.handle}
                  </span>
                </div>
                <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
