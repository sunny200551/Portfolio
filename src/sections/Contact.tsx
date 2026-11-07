import type { GitHubProfile } from '../hooks/useGitHubData';
import React, { useState, useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, Copy, Check, ExternalLink, MapPin } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTACT_INFO } from '../data/contact';
import { robotStore } from '../robot/robotStore';

gsap.registerPlugin(ScrollTrigger);

interface ContactProps {
  profile?: GitHubProfile | null;
}

export const Contact: React.FC<ContactProps> = () => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tiles = containerRef.current?.querySelectorAll('.contact-stagger-tile');
      if (tiles && tiles.length > 0) {
        gsap.fromTo(
          tiles,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const textToCopy = CONTACT_INFO.email;
    let successful = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        successful = true;
      } catch {
        successful = false;
      }
    }

    if (!successful) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        successful = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        successful = false;
      }
    }

    if (successful) {
      setCopied(true);
      robotStore.setContactAction('cheer');
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        robotStore.setContactAction('building');
      }, 2000);
    }
  };

  const mailtoUrl = `mailto:${CONTACT_INFO.email}?subject=Hello%20Sunny`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_INFO.email)}&su=Hello%20Sunny`;
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(CONTACT_INFO.email)}&subject=Hello%20Sunny`;

  return (
    <section
      id="contact"
      ref={containerRef}
      className="w-full bg-[#0047AB] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 relative z-10 border-t-2 border-b-2 border-[#0A0A0A] scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="w-full max-w-[2200px] mx-auto lane-padded">
        
        {/* Section Pill */}
        <div
          data-robot-anchor="contact:submit"
          data-robot-offset-x="-50"
          data-robot-offset-y="-20"
          className="inline-block px-3 py-1 bg-[#FF5A1F] text-black font-mono font-bold text-xs uppercase border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] mb-8"
        >
          09 // CONTACT
        </div>

        {/* Compact Cobalt Block Header */}
        <div className="mb-10">
          <h2
            data-robot-anchor="contact:headline"
            className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none"
          >
            LET'S WORK TOGETHER.
          </h2>
          <p className="font-mono text-sm sm:text-base text-white/90 mt-3 font-bold tracking-wide">
            Available for opportunities.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Big Primary Tile Spanning Full Width */}
          <a
            href={mailtoUrl}
            data-robot-react="contact:copy-email"
            className="contact-stagger-tile group w-full p-6 sm:p-8 md:p-10 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_#0A0A0A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer"
          >
            <div className="flex flex-col gap-2 min-w-0">
              <span className="font-mono text-xs font-black uppercase tracking-widest text-[#0047AB] group-hover:text-black transition-colors">
                EMAIL
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
              className="px-4 py-2.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A] font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>Open in Gmail</span>
            </a>

            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A] font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>Open in Outlook</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              data-robot-react="contact:copy-email"
              className="px-4 py-2.5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A] font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-[#0047AB]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy address'}</span>
            </button>
          </div>
          {copied && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[#FF5A1F] text-black font-mono text-xs font-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex items-center gap-2 animate-bounce select-none">
              <Check size={16} />
              <span>EMAIL COPIED TO CLIPBOARD! 📋</span>
            </div>
          )}

          {/* Large Flat Tiles: LinkedIn, GitHub, Instagram, and Location Chip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* LinkedIn */}
            <a
              href={CONTACT_INFO.social.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-stagger-tile group p-5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tight leading-tight">
                  {CONTACT_INFO.social.linkedin.name}
                </span>
                <span className="font-mono text-xs opacity-75 font-bold mt-0.5">
                  {CONTACT_INFO.social.linkedin.handle}
                </span>
              </div>
              <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
            </a>

            {/* GitHub */}
            <a
              href={CONTACT_INFO.social.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-stagger-tile group p-5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tight leading-tight">
                  {CONTACT_INFO.social.github.name}
                </span>
                <span className="font-mono text-xs opacity-75 font-bold mt-0.5">
                  @{CONTACT_INFO.social.github.handle}
                </span>
              </div>
              <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
            </a>

            {/* Instagram */}
            <a
              href={CONTACT_INFO.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-stagger-tile group p-5 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-[#0A0A0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tight leading-tight">
                  {CONTACT_INFO.social.instagram.name}
                </span>
                <span className="font-mono text-xs opacity-75 font-bold mt-0.5">
                  @{CONTACT_INFO.social.instagram.handle}
                </span>
              </div>
              <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
            </a>

            {/* Location: India Chip (Not a link) */}
            <div className="contact-stagger-tile p-5 bg-[#EEF2FA] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex items-center justify-between select-none">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase font-bold text-[#0047AB]">
                  LOCATION
                </span>
                <span className="font-display font-black text-xl tracking-tight leading-tight mt-0.5">
                  {CONTACT_INFO.country}
                </span>
              </div>
              <div className="p-2 bg-white border border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A] shrink-0 ml-2">
                <MapPin size={18} className="text-[#0047AB]" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
