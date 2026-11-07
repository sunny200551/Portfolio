import React, { useState } from 'react';
import { Mail, ArrowUp, FileText, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { CONTACT_INFO } from '../data/contact';
import type { GitHubProfile } from '../hooks/useGitHubData';
import { robotStore } from '../robot/robotStore';

interface FooterProps {
  profile?: GitHubProfile | null;
}

const navLinks = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'work', label: 'WORK' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'github', label: 'GITHUB' },
  { id: 'stats', label: 'STATS' },
  { id: 'events', label: 'EVENTS' },
  { id: 'journey', label: 'JOURNEY' },
  { id: 'contact', label: 'CONTACT' },
];

export const Footer: React.FC<FooterProps> = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const scrollToTop = () => {
    robotStore.setBackToTopFlying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      robotStore.setBackToTopFlying(false);
    }, 1800);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_INFO.email);
    setCopiedEmail(true);
    robotStore.showSpeechBubble("Email copied! Drop Sunny a line! ✉️✨", 3000);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <footer 
      data-robot-anchor="footer:sleep" 
      className="border-t-2 border-[#0A0A0A] bg-[#0A1A3F] text-white py-16 lane-padded relative z-10 font-mono w-full"
    >
      <div className="w-full max-w-[2200px] mx-auto flex flex-col gap-12">
        
        {/* ============================================================= */}
        {/* TOP ROW: Identity + Resume + Back to Top                      */}
        {/* ============================================================= */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/15 pb-8">
          
          {/* Identity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg px-2.5 py-0.5 bg-[#FF5A1F] text-black border border-white shadow-[2px_2px_0px_#FFFFFF]">
                SP
              </span>
              <span className="font-display font-black text-2xl uppercase tracking-wider text-white">
                SUNNY PASUMARTHI
              </span>
            </div>
            <p className="text-xs text-white/70">
              Computer Science Student • Frontend Developer • Blockchain Enthusiast
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold text-xs uppercase border-2 border-white hover:bg-[#FF5A1F] hover:border-black transition-all cursor-pointer shadow-[3px_3px_0px_#0A0A0A]"
            >
              <FileText size={14} />
              <span>RESUME (PDF)</span>
            </a>

            <button
              data-robot-anchor="footer:top-btn"
              data-robot-react="footer:back-to-top"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5A1F] text-black font-bold text-xs uppercase border-2 border-white hover:bg-white transition-all cursor-pointer shadow-[3px_3px_0px_#0A0A0A]"
              title="Scroll back to top"
            >
              <span>BACK TO TOP</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* STEVE'S DISPATCH HUB // HOW SUNNY RESPONDS & REACH OUT GUIDE  */}
        {/* ============================================================= */}
        <div className="bg-[#050C1A] border-2 border-white/20 p-6 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_#0A0A0A]">
          
          {/* Top Banner with Steve Callout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
            <div className="flex items-center gap-3">
              {/* Mini Seated Steve SVG Avatar */}
              <div className="w-12 h-12 bg-[#FF5A1F] border-2 border-white shrink-0 flex items-center justify-center shadow-[2px_2px_0px_#0047AB]">
                <svg viewBox="0 0 40 40" className="w-9 h-9">
                  {/* Steve Head */}
                  <rect x="6" y="8" width="28" height="22" rx="3" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="2" />
                  <rect x="10" y="12" width="20" height="14" rx="2" fill="#0047AB" stroke="#0A0A0A" strokeWidth="1.5" />
                  {/* Smiling Eyes */}
                  <path d="M14 19 L16 16 L18 19" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M22 19 L24 16 L26 19" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Antenna */}
                  <line x1="20" y1="8" x2="20" y2="3" stroke="#0A1A3F" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="20" cy="2" r="2" fill="#FFD700" stroke="#0A0A0A" strokeWidth="1" />
                </svg>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FF5A1F] text-black text-[10px] font-black uppercase tracking-wider mb-1">
                  <span>STEVE’S DISPATCH</span>
                  <span>⚡</span>
                </div>
                <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                  HOW TO REACH SUNNY & RESPONSE TIMES
                </h3>
              </div>
            </div>

            {/* Availability Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/15 text-xs">
              <span className="w-2.5 h-2.5 bg-[#00D26A] rounded-full animate-pulse" />
              <span className="text-white/90 font-bold">STATUS: ACTIVELY REPLYING</span>
            </div>
          </div>

          {/* Steve's Speech Commentary */}
          <div className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] p-4 mb-6 shadow-[3px_3px_0px_#FF5A1F] relative">
            <div className="text-[10px] font-black uppercase text-[#0047AB] mb-0.5">
              STEVE PRO-TIP //
            </div>
            <p className="text-xs sm:text-sm font-sans font-medium leading-relaxed">
              &ldquo;Want Sunny to see your message instantly? <strong>DM him on Instagram or LinkedIn</strong> — that&rsquo;s where he is most active and replies within a few hours! For formal proposals or documents, shoot him a direct email.&rdquo;
            </p>
          </div>

          {/* 3 Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Channel 1: Instagram */}
            <div className="bg-white/5 border border-white/15 p-4 flex flex-col justify-between gap-3 hover:border-[#FF5A1F] transition-all">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">INSTAGRAM</span>
                  <span className="px-2 py-0.5 bg-[#FF5A1F] text-black font-black text-[9px] uppercase">
                    FASTEST • HOURS
                  </span>
                </div>
                <div className="text-xs text-[#FF5A1F] font-bold">@sunny_pasumarthi</div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Active daily. Ideal for casual intros, tech discussions, fast questions, or sharing ideas.
                </p>
              </div>

              <a
                href="https://instagram.com/sunny_pasumarthi"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FF5A1F] text-black font-bold text-xs uppercase hover:bg-white transition-colors cursor-pointer"
              >
                <span>DM ON INSTAGRAM</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Channel 2: LinkedIn */}
            <div className="bg-white/5 border border-white/15 p-4 flex flex-col justify-between gap-3 hover:border-[#0047AB] transition-all">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">LINKEDIN</span>
                  <span className="px-2 py-0.5 bg-[#0047AB] text-white font-black text-[9px] uppercase">
                    SAME DAY • HOURS
                  </span>
                </div>
                <div className="text-xs text-[#60A5FA] font-bold">sunny-pasumarthi</div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Checked multiple times a day. Best for internship inquiries, project contracts, and team networking.
                </p>
              </div>

              <a
                href="https://www.linkedin.com/in/sunny-pasumarthi-357615333/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0047AB] text-white font-bold text-xs uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                <span>CONNECT ON LINKEDIN</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Channel 3: Direct Email */}
            <div className="bg-white/5 border border-white/15 p-4 flex flex-col justify-between gap-3 hover:border-white transition-all">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">DIRECT EMAIL</span>
                  <span className="px-2 py-0.5 bg-white text-black font-black text-[9px] uppercase">
                    WITHIN 24H
                  </span>
                </div>
                <div className="text-xs text-white/90 font-bold truncate">{CONTACT_INFO.email}</div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Official inbox for formal opportunities, comprehensive specs, and long-term partnerships.
                </p>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-white text-black font-bold text-xs uppercase hover:bg-[#FF5A1F] transition-colors cursor-pointer"
                >
                  {copiedEmail ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedEmail ? 'COPIED!' : 'COPY EMAIL'}</span>
                </button>

                <a
                  href={`mailto:${CONTACT_INFO.email}?subject=Hello%20Sunny`}
                  className="p-2 bg-white/10 border border-white/30 text-white hover:bg-white hover:text-black transition-colors"
                  title="Send Email"
                >
                  <Mail size={14} />
                </a>
              </div>
            </div>

          </div>

          {/* Quick Specs & Mascot Showcase Link Footer Bar */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
            <div className="flex flex-wrap items-center gap-4">
              <span>📍 INDIA (IST • UTC +5:30)</span>
              <span>•</span>
              <span>🎓 COMPUTER SCIENCE & ENGINEERING</span>
              <span>•</span>
              <span className="text-[#00D26A] font-bold">READY TO BUILD</span>
            </div>

            {/* Link to Steve Mascot Expressions Suite */}
            <a
              href="/?robot-showcase=true"
              className="inline-flex items-center gap-1.5 text-xs text-[#FF5A1F] hover:text-white font-bold transition-colors cursor-pointer"
            >
              <Sparkles size={13} />
              <span>OPEN STEVE MASCOT SUITE (EXPRESSIONS & POSES) ↗</span>
            </a>
          </div>

        </div>

        {/* ============================================================= */}
        {/* NAVIGATION LINKS                                              */}
        {/* ============================================================= */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-white/80">
          <span className="text-white/50 uppercase mr-1 text-[10px]">QUICK JUMP:</span>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="hover:text-[#FF5A1F] transition-colors cursor-pointer uppercase"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* ============================================================= */}
        {/* SOCIAL ICONS & COPYRIGHT                                      */}
        {/* ============================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4 border-t border-white/15">
          
          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/sunny200551"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/10 border border-white/25 text-white hover:bg-[#FF5A1F] hover:text-black hover:border-black transition-colors"
              title="GitHub Profile"
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
              className="p-2 bg-white/10 border border-white/25 text-white hover:bg-[#0047AB] hover:text-white hover:border-black transition-colors"
              title="LinkedIn Profile"
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
              className="p-2 bg-white/10 border border-white/25 text-white hover:bg-[#FF5A1F] hover:text-black hover:border-black transition-colors"
              title="Instagram Profile"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <a
              href={`mailto:${CONTACT_INFO.email}?subject=Hello%20Sunny`}
              className="p-2 bg-white/10 border border-white/25 text-white hover:bg-[#FF5A1F] hover:text-black hover:border-black transition-colors"
              title="Email Sunny Directly"
            >
              <Mail size={16} />
            </a>
          </div>

          {/* Colophon */}
          <div className="text-[11px] text-white/60">
            © {new Date().getFullYear()} Sunny Pasumarthi • All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
