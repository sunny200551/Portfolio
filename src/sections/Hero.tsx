import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowRight, Mail, Instagram } from 'lucide-react';
import { GitHubProfile } from '../hooks/useGitHubData';

interface HeroProps {
  onContactClick: () => void;
  profile: GitHubProfile | null;
}

export const Hero: React.FC<HeroProps> = ({ onContactClick }) => {
  const [typedText, setTypedText] = useState('');
  const headlines = [
    'Computer Science Engineering Student',
    'Full Stack Developer',
    'Blockchain Enthusiast'
  ];
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    let timer: number;
    const currentHeadline = headlines[headlineIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        setTypedText(currentHeadline.substring(0, typedText.length + 1));
        if (typedText === currentHeadline) {
          // Pause at full text
          setTypingSpeed(1800);
          setIsDeleting(true);
        } else {
          setTypingSpeed(80 + Math.random() * 40);
        }
      } else {
        setTypedText(currentHeadline.substring(0, typedText.length - 1));
        if (typedText === '') {
          setIsDeleting(false);
          setHeadlineIndex((prev) => (prev + 1) % headlines.length);
          setTypingSpeed(300);
        } else {
          setTypingSpeed(40);
        }
      }
    };

    timer = window.setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, headlineIndex, typingSpeed]);

  return (
    <section id="hero" className="relative min-h-[90svh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden z-10">
      {/* Background spotlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] rounded-full bg-violet-600/10 dark:bg-violet-600/10 blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] rounded-full bg-blue-600/10 dark:bg-blue-600/10 blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '-4s' }} />

      <div className="max-w-4xl text-center flex flex-col items-center gap-6">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/5 text-violet-300 text-xs font-mono tracking-widest uppercase flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Available for Opportunities
        </motion.div>

        {/* Profile Image Frame */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-violet-600 to-cyan-400 shadow-2xl group cursor-pointer"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-2 border-zinc-950">
            <img
              src={profile?.avatar_url || "https://github.com/sunny200551.png"}
              alt="Sunny Pasumarthi"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // Fallback avatar if load fails
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=sunny`;
              }}
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 blur opacity-30 group-hover:opacity-60 transition-opacity duration-300 -z-10" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent leading-none">
            {profile?.name || "Sunny Pasumarthi"}
          </h1>
          <div className="h-8 sm:h-10 flex items-center justify-center">
            <span className="text-lg sm:text-2xl font-mono font-medium text-cyan-400 text-glow-blue">
              {typedText}
              <span className="animate-pulse font-light">|</span>
            </span>
          </div>
        </motion.div>

        {/* Short About Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-zinc-400 dark:text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed"
        >
          {profile?.bio || "Computer Science Engineering student passionate about full stack development, blockchain systems, and building high-performance modern web solutions."}
        </motion.p>

        {/* Quick Socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex gap-4 items-center mt-2"
        >
          <a href="https://github.com/sunny200551" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-zinc-100 hover:scale-110 transition-all" title="GitHub">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/sunny-pasumarthi-357615333/" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-zinc-100 hover:scale-110 transition-all" title="LinkedIn">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a href="https://instagram.com/sunny_pasumarthi" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-zinc-100 hover:scale-110 transition-all" title="Instagram">
            <Instagram size={20} />
          </a>
          <a href="mailto:sunnypasumarthi9@gmail.com" className="p-2 text-zinc-400 hover:text-zinc-100 hover:scale-110 transition-all" title="Email">
            <Mail size={20} />
          </a>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mt-6"
        >
          <button
            onClick={onContactClick}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-violet-600/90 hover:bg-violet-600 text-white rounded-xl shadow-lg hover:shadow-violet-600/20 hover:scale-103 active:scale-97 cursor-pointer transition-all border border-violet-500/25 font-semibold text-sm"
          >
            Get In Touch
            <ArrowRight size={16} />
          </button>
          
          <a
            href="/resume.txt"
            download="Sunny_Pasumarthi_Resume.txt"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl cursor-pointer border border-white/8 transition-all hover:scale-103 font-semibold text-sm backdrop-blur-md"
          >
            <Download size={16} />
            Download Resume
          </a>
        </motion.div>
      </div>
    </section>
  );
};
export default Hero;
