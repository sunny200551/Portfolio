import { robotStore } from '../robot/robotStore';
import React, { useState } from 'react';
import { Mail, MapPin, Send, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { saveContactMessage, isFirebaseConfigured } from '../firebase';
import { FlatConfetti } from '../components/ui/FlatConfetti';
import type { GitHubProfile } from '../hooks/useGitHubData';

interface ContactProps {
  profile?: GitHubProfile | null;
}

export const Contact: React.FC<ContactProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '' // Anti-spam bot honeypot
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOfflineDraft, setIsOfflineDraft] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('sunnypasumarthi9@gmail.com');
    setCopiedEmail(true);
    robotStore.setContactAction('cheer');
    setTimeout(() => {
      setCopiedEmail(false);
      robotStore.setContactAction('building');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check for bots
    if (formData.honeypot) {
      setStatus('success');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please complete all required fields.');
      return;
    }

    // Valid email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus('error');
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setStatus('loading');
    robotStore.setContactAction('rocket');
    setTimeout(() => {
      robotStore.setContactAction('building');
    }, 2500);
    
    try {
      const result = await saveContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || 'General Inquiry',
        message: formData.message.trim()
      });
      
      if (result.success) {
        setIsOfflineDraft(Boolean(result.isOfflineDraft));
        setStatus('success');
        setShowConfetti(true);
        setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to dispatch message.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <section id="contact" className="w-full bg-[#0047AB] text-white py-16 md:py-24 relative z-10 border-t-2 border-b-2 border-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Pill */}
        <div data-robot-anchor="contact:submit" data-robot-offset-x="-50" data-robot-offset-y="-20" className="inline-block px-3 py-1 bg-[#FF5A1F] text-black font-mono font-bold text-xs uppercase border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] mb-8">
          09 // CONTACT
        </div>

        {/* Giant Headline */}
        <div className="mb-14">
          <h2 data-robot-anchor="contact:headline" className="font-display font-black text-4xl sm:text-7xl md:text-8xl uppercase tracking-tight text-white leading-none">
            LET'S BUILD SOMETHING.
          </h2>
          <p className="font-mono text-xs sm:text-base text-white/80 mt-4 max-w-2xl leading-relaxed">
            Have a project in mind, an opportunity, or want to collaborate? Send a message or reach out through direct channels.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* Direct Channels Column */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            
            {/* Direct Cards */}
            <div className="p-6 sm:p-8 bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] text-[#0A0A0A] flex flex-col justify-between gap-6">
              <div>
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#0A0A0A] border-b-2 border-[#0A0A0A] pb-3 mb-5">
                  DIRECT CONTACT
                </h3>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  {/* Email */}
                  <div className="p-3.5 bg-[#EEF2FA] border-2 border-[#0A0A0A] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FF5A1F] text-black border border-[#0A0A0A]">
                        <Mail size={16} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#0A0A0A]/60 uppercase font-bold">Email</span>
                        <a href="mailto:sunnypasumarthi9@gmail.com" className="text-[#0A0A0A] font-bold hover:text-[#0047AB] transition-colors break-all">
                          sunnypasumarthi9@gmail.com
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyEmail}
                      aria-label="Copy email"
                      className="p-1.5 border border-[#0A0A0A] bg-white hover:bg-[#FF5A1F] text-black transition-colors cursor-pointer shrink-0"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check size={14} className="text-black" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Location */}
                  <div className="p-3.5 bg-[#EEF2FA] border-2 border-[#0A0A0A] flex items-center gap-3">
                    <div className="p-2 bg-[#0047AB] text-white border border-[#0A0A0A]">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#0A0A0A]/60 uppercase font-bold">Location</span>
                      <span className="text-[#0A0A0A] font-bold">
                        {profile?.location || 'Nellore, Andhra Pradesh, India'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Social Channels */}
              <div>
                <span className="font-mono text-xs font-bold text-[#0A0A0A] uppercase block mb-3">
                  Verified Social Channels
                </span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold">
                  <a
                    href="https://github.com/sunny200551"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#FF5A1F] hover:text-black transition-colors flex flex-col items-center gap-1.5 text-center"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                    <span>GITHUB</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/sunny-pasumarthi-357615333/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#FF5A1F] hover:text-black transition-colors flex flex-col items-center gap-1.5 text-center"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    <span>LINKEDIN</span>
                  </a>

                  <a
                    href="https://instagram.com/sunny_pasumarthi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#FF5A1F] hover:text-black transition-colors flex flex-col items-center gap-1.5 text-center"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>INSTAGRAM</span>
                  </a>
                </div>
              </div>

              {/* Backend Notice */}
              <div className="pt-4 border-t-2 border-[#0A0A0A]/10 font-mono text-[11px] text-[#0A0A0A]/70">
                {isFirebaseConfigured ? (
                  <span className="flex items-center gap-2 font-bold text-[#0047AB]">
                    <span className="w-2.5 h-2.5 bg-[#0047AB] border border-[#0A0A0A]" />
                    BACKEND CONNECTED
                  </span>
                ) : (
                  <span className="flex items-center gap-2 font-bold text-[#0A1A3F]">
                    <span className="w-2.5 h-2.5 bg-[#FF5A1F] border border-[#0A0A0A]" />
                    LOCAL DRAFT MODE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Column on White Flat Panel */}
          <div className="col-span-12 lg:col-span-7 relative">
            
            {/* Flat Confetti Burst overlay on success */}
            {showConfetti && <FlatConfetti onComplete={() => setShowConfetti(false)} />}

            <div className="p-6 sm:p-10 bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] text-[#0A0A0A] relative">
              <div className="border-b-2 border-[#0A0A0A] pb-4 mb-6 flex items-center justify-between">
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#0A0A0A]">
                  SEND A MESSAGE
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* Honeypot field (hidden from view) */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-mono font-bold uppercase text-[#0A0A0A]">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      onFocus={() => robotStore.setContactInputFocus('name')}
                      onBlur={() => robotStore.setContactInputFocus(null)}
                      value={formData.name}
                      onChange={handleChange}
                      disabled={status === 'loading'}
                      placeholder="Your name"
                      className="px-4 py-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] text-[#0A0A0A] text-sm focus:bg-white focus:outline-none transition-all font-mono no-custom-cursor"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-mono font-bold uppercase text-[#0A0A0A]">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      onFocus={() => robotStore.setContactInputFocus('email')}
                      onBlur={() => robotStore.setContactInputFocus(null)}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={status === 'loading'}
                      placeholder="you@domain.com"
                      className="px-4 py-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] text-[#0A0A0A] text-sm focus:bg-white focus:outline-none transition-all font-mono no-custom-cursor"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-xs font-mono font-bold uppercase text-[#0A0A0A]">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    onFocus={() => robotStore.setContactInputFocus('subject')}
                    onBlur={() => robotStore.setContactInputFocus(null)}
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    placeholder="Project Inquiry / Frontend Development"
                    className="px-4 py-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] text-[#0A0A0A] text-sm focus:bg-white focus:outline-none transition-all font-mono no-custom-cursor"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-mono font-bold uppercase text-[#0A0A0A]">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    onFocus={() => robotStore.setContactInputFocus('message')}
                    onBlur={() => robotStore.setContactInputFocus(null)}
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    placeholder="Describe your project, timeline, or message..."
                    className="px-4 py-3 bg-[#EEF2FA] border-2 border-[#0A0A0A] text-[#0A0A0A] text-sm focus:bg-white focus:outline-none transition-all resize-none font-mono no-custom-cursor"
                  />
                </div>

                {/* Submit Button & Status Alerts */}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    data-robot-anchor="contact:send-btn"
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-[#FF5A1F] hover:bg-[#0A0A0A] hover:text-white disabled:bg-gray-300 text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] font-mono font-bold text-xs uppercase cursor-pointer transition-all active:translate-y-0.5 active:shadow-[2px_2px_0px_#0A0A0A]"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>SENDING MESSAGE...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>SEND MESSAGE</span>
                      </>
                    )}
                  </button>

                  {/* Success Alert */}
                  {status === 'success' && (
                    <div className="p-4 bg-[#EEF2FA] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] text-black font-mono text-xs">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <CheckCircle2 size={16} className="text-[#0047AB] shrink-0" />
                        <span>
                          {isOfflineDraft ? 'OFFLINE DRAFT RECORDED' : 'MESSAGE SENT'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#0A0A0A]/80 leading-relaxed mt-1">
                        {isOfflineDraft
                          ? 'Firebase environment credentials are not active on this build. Your message was saved locally as an offline draft. Please email sunnypasumarthi9@gmail.com directly for an immediate reply.'
                          : 'Your message was sent successfully. I will reply to your provided email address shortly.'}
                      </p>
                    </div>
                  )}

                  {/* Error Alert */}
                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-[#FF5A1F]/20 border-2 border-[#0A0A0A] text-black text-xs font-mono font-bold">
                      <AlertCircle size={16} className="text-[#FF5A1F] shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>

              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;
