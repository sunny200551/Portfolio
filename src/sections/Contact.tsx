import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveContactMessage } from '../firebase';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '../components/SpotlightCard';
import { GitHubProfile } from '../hooks/useGitHubData';

interface ContactProps {
  profile: GitHubProfile | null;
}

export const Contact: React.FC<ContactProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setStatus('loading');
    
    try {
      const result = await saveContactMessage(formData);
      
      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Trigger celebratory confetti burst!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#a855f7', '#3b82f6']
        });
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to send message.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <section id="contact" className="py-24 px-4 max-w-6xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Get In Touch
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          Connect / Send a Message
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-stretch">
        {/* Contact Info Column (Span 5) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <SpotlightCard className="flex-grow flex flex-col justify-between gap-8 p-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-zinc-100">Let's talk about keys</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Whether you want to discuss full stack code cycles, smart contract layers, or coordinate collaborative projects, drop a line.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4 text-sm">
                <div className="p-3 rounded-lg bg-zinc-900 border border-violet-500/20 text-violet-400">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Email Address</span>
                  <a href="mailto:sunnypasumarthi9@gmail.com" className="text-zinc-200 hover:text-cyan-400 transition-colors">
                    sunnypasumarthi9@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="p-3 rounded-lg bg-zinc-900 border border-cyan-500/20 text-cyan-400">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Communication Channel</span>
                  <span className="text-zinc-300">GitHub Open Issues / Inboxes</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="p-3 rounded-lg bg-zinc-900 border border-pink-500/20 text-pink-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Location</span>
                  <span className="text-zinc-300">{profile?.location || 'India'}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono border-t border-white/5 pt-4">
              🔒 Submissions are cataloged inside a secure client database.
            </div>
          </SpotlightCard>
        </div>

        {/* Contact Form Column (Span 7) */}
        <div className="col-span-12 lg:col-span-7">
          <SpotlightCard className="p-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-mono text-zinc-400">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    placeholder="Enter your name"
                    className="px-4 py-3 bg-zinc-900/60 border border-white/8 rounded-xl outline-none text-zinc-200 text-sm focus:border-violet-500/50 focus:bg-zinc-900 transition-all font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-mono text-zinc-400">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    placeholder="name@example.com"
                    className="px-4 py-3 bg-zinc-900/60 border border-white/8 rounded-xl outline-none text-zinc-200 text-sm focus:border-violet-500/50 focus:bg-zinc-900 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-xs font-mono text-zinc-400">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  placeholder="What is this about?"
                  className="px-4 py-3 bg-zinc-900/60 border border-white/8 rounded-xl outline-none text-zinc-200 text-sm focus:border-violet-500/50 focus:bg-zinc-900 transition-all font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-mono text-zinc-400">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  placeholder="Write your message here..."
                  className="px-4 py-3 bg-zinc-900/60 border border-white/8 rounded-xl outline-none text-zinc-200 text-sm focus:border-violet-500/50 focus:bg-zinc-900 transition-all resize-none font-sans"
                />
              </div>

              {/* Submit Button & Notifications */}
              <div className="flex flex-col gap-4 mt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-700/50 text-white rounded-xl shadow-lg font-bold text-sm cursor-pointer transition-all hover:scale-101 active:scale-99"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>

                {/* Submit Feedback */}
                {status === 'success' && (
                  <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 rounded-xl text-xs sm:text-sm font-mono">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Message received! Confetti launched. Thank you.</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/35 text-rose-400 rounded-xl text-xs sm:text-sm font-mono">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </form>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};
export default Contact;
