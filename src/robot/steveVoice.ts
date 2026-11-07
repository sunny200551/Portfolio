import { robotStore } from './robotStore';
import type { RobotAnimation, RobotExpression } from './types';

export type VoiceCategory =
  | 'greeting'
  | 'section_about'
  | 'section_work'
  | 'section_skills'
  | 'section_github'
  | 'section_stats'
  | 'section_events'
  | 'section_journey'
  | 'section_contact'
  | 'idle_reading'
  | 'card_hover'
  | 'click_contact'
  | 'click_resume'
  | 'copy_email'
  | 'skills_filter'
  | 'chip_hover'
  | 'skills_chip_click'
  | 'rail_hover'
  | 'palette_open'
  | 'palette_close'
  | 'fast_scroll'
  | 'back_to_top'
  | 'click_steve'
  | 'click_steve_overheat'
  | 'shy_pickup'
  | 'section_internship'
  | 'section_content'
  | 'internship_badge_hover'
  | 'internship_cert_click'
  | 'content_scrub'
  | 'content_clip_click'
  | 'content_stats_hover'
  | 'content_return';

interface VoiceLine {
  text: string;
  anim?: RobotAnimation;
  expr?: RobotExpression;
  priority?: number; // higher = more important
}

const VOICE_POOLS: Record<VoiceCategory, VoiceLine[]> = {
  greeting: [
    { text: "Hi, I'm Steve. Yes, the Steve.", anim: 'wave', expr: 'happy', priority: 10 },
    { text: "Steve here. Looking great today, by the way.", anim: 'wave', expr: 'flirty', priority: 10 },
    { text: "Welcome! I saved you the best seat.", anim: 'cheer', expr: 'happy', priority: 10 },
    { text: "Hey there! Ready to see some clean code?", anim: 'salute', expr: 'focused', priority: 10 },
    { text: "Steve at your service. Let's explore together!", anim: 'wave', expr: 'proud', priority: 10 },
  ],
  section_about: [
    { text: "Ooh, the origin story. I love a good one.", anim: 'idle', expr: 'curious' },
    { text: "A computer science mind at work. Intriguing.", anim: 'idle', expr: 'thinking' },
    { text: "Origin chapters are always the most captivating.", anim: 'salute', expr: 'focused' },
    { text: "Getting to know the creator? Good strategy.", anim: 'wave', expr: 'flirty' },
    { text: "Behind every great repo is an origin story.", anim: 'cheer', expr: 'happy' },
  ],
  section_work: [
    { text: "Projects! Steve-approved, ten out of ten.", anim: 'cheer', expr: 'excited' },
    { text: "Careful, these projects might steal your heart.", anim: 'idle', expr: 'flirty' },
    { text: "Built with passion and lots of caffeine.", anim: 'salute', expr: 'proud' },
    { text: "Shipped and verified. Quality at first glance.", anim: 'idle', expr: 'happy' },
    { text: "Take a look around. Everything was handcrafted.", anim: 'wave', expr: 'curious' },
  ],
  section_skills: [
    { text: "So many skills. Almost as many as my pickup lines.", anim: 'dance', expr: 'flirty' },
    { text: "A stack this sharp is downright dangerous.", anim: 'salute', expr: 'proud' },
    { text: "TypeScript, React, Web3... somebody has great taste.", anim: 'cheer', expr: 'happy' },
    { text: "Skill loadout fully synchronized. Pick your favorite!", anim: 'idle', expr: 'focused' },
    { text: "Full-stack versatility. Hard not to admire.", anim: 'wave', expr: 'excited' },
  ],
  section_github: [
    { text: "Look at all those commits. Commitment is attractive.", anim: 'jump', expr: 'flirty' },
    { text: "Green squares as far as the eye can see.", anim: 'cheer', expr: 'happy' },
    { text: "Skyline rendered! Sunny builds daily.", anim: 'salute', expr: 'focused' },
    { text: "Consistent daily commits? That takes real discipline.", anim: 'idle', expr: 'proud' },
    { text: "Now that's what I call a solid track record.", anim: 'jump', expr: 'excited' },
  ],
  section_stats: [
    { text: "Numbers don't lie, and these look good.", anim: 'jump', expr: 'focused' },
    { text: "Problems solved, streaks maintained. Impressive.", anim: 'cheer', expr: 'happy' },
    { text: "Stats like these make my circuits flutter.", anim: 'idle', expr: 'flirty' },
    { text: "Data never looked so sleek.", anim: 'salute', expr: 'proud' },
    { text: "Pure analytical excellence. Ten out of ten.", anim: 'jump', expr: 'excited' },
  ],
  section_events: [
    { text: "Hackathons? Brains and stamina. Swoon.", anim: 'dance', expr: 'flirty' },
    { text: "Hackathons, trophies and late-night builds.", anim: 'cheer', expr: 'excited' },
    { text: "Winning hackathons is kind of a habit here.", anim: 'salute', expr: 'proud' },
    { text: "Competitive coding? Passion in high gear.", anim: 'jump', expr: 'focused' },
    { text: "Ready for the next hackathon podium finish.", anim: 'wave', expr: 'happy' },
  ],
  section_journey: [
    { text: "Every great story starts somewhere. Walk with me?", anim: 'walk', expr: 'flirty' },
    { text: "From first line of code to Web3 architecture.", anim: 'walk', expr: 'proud' },
    { text: "Milestones passed, summits reached.", anim: 'jump', expr: 'excited' },
    { text: "A continuous journey of learning and shipping.", anim: 'salute', expr: 'focused' },
    { text: "I've been here the whole way. It's a great ride.", anim: 'wave', expr: 'happy' },
  ],
  section_internship: [
    { text: "Professional Steve, reporting for duty.", anim: 'salute', expr: 'focused' },
    { text: "Look at me, I'm wearing a tie! Very corporate.", anim: 'salute', expr: 'proud' },
    { text: "Real industry code. Clean, tested and audited.", anim: 'idle', expr: 'thinking' },
    { text: "Official apprentice badge unlocked. Sharp look!", anim: 'cheer', expr: 'happy' },
    { text: "Corporate Steve has officially entered the building.", anim: 'wave', expr: 'flirty' },
  ],
  section_content: [
    { text: "Lights, camera, Steve!", anim: 'cheer', expr: 'excited' },
    { text: "Behind every great video is a very tired editor.", anim: 'idle', expr: 'thinking' },
    { text: "Welcome to the Edit Bay. Popcorn not included.", anim: 'wave', expr: 'happy' },
    { text: "Rendering frames and turning caffeine into cuts.", anim: 'salute', expr: 'focused' },
    { text: "Multi-track magic in progress! Action!", anim: 'dance', expr: 'enjoying' },
  ],
  internship_badge_hover: [
    { text: "Official badge. Very official. Very handsome.", anim: 'salute', expr: 'proud' },
    { text: "Security pass verified. You may proceed.", anim: 'idle', expr: 'focused' },
    { text: "Inspecting credentials with my magnifying loupe.", anim: 'idle', expr: 'curious' },
    { text: "Look at those highlights! Real engineering impact.", anim: 'cheer', expr: 'happy' },
    { text: "Certified apprentice in action. Top marks.", anim: 'salute', expr: 'happy' },
  ],
  internship_cert_click: [
    { text: "Official proof of greatness!", anim: 'cheer', expr: 'excited', priority: 6 },
    { text: "Certificates make everything ten times more real.", anim: 'salute', expr: 'proud', priority: 6 },
    { text: "Verified and stamped. Excellent!", anim: 'jump', expr: 'happy', priority: 6 },
    { text: "Credentials loaded with honors.", anim: 'dance', expr: 'happy', priority: 6 },
    { text: "Thumbs up for verified achievement!", anim: 'salute', expr: 'focused', priority: 6 },
  ],
  content_scrub: [
    { text: "Scrubbing the timeline like a pro editor.", anim: 'walk', expr: 'focused' },
    { text: "Finding the perfect cut point.", anim: 'idle', expr: 'thinking' },
    { text: "Playhead in motion! Frame accurate.", anim: 'walk', expr: 'excited' },
    { text: "Scrub, scrub, cut! Music in sync.", anim: 'dance', expr: 'enjoying' },
    { text: "Rolling 60 frames per second right here.", anim: 'salute', expr: 'focused' },
  ],
  content_clip_click: [
    { text: "Go on, hit play. I'll wait right here.", anim: 'wave', expr: 'happy', priority: 5 },
    { text: "Opening the video in a new tab! Enjoy the cut.", anim: 'cheer', expr: 'excited', priority: 5 },
    { text: "Grab some popcorn, this one has great pacing.", anim: 'jump', expr: 'flirty', priority: 5 },
    { text: "Directing this was a masterclass.", anim: 'salute', expr: 'proud', priority: 5 },
    { text: "Streaming greatness right now. Enjoy!", anim: 'dance', expr: 'enjoying', priority: 5 },
  ],
  content_stats_hover: [
    { text: "Real views, zero bots. Certified creator counts.", anim: 'cheer', expr: 'proud' },
    { text: "The numbers keep climbing! Community approved.", anim: 'jump', expr: 'happy' },
    { text: "Creator analytics look sleek. High engagement!", anim: 'salute', expr: 'focused' },
    { text: "Every view was someone entertained or educated.", anim: 'wave', expr: 'flirty' },
    { text: "Clapping for real milestones! Ten out of ten.", anim: 'cheer', expr: 'excited' },
  ],
  content_return: [
    { text: "Welcome back! I missed you while you watched.", anim: 'wave', expr: 'flirty', priority: 7 },
    { text: "Back already? Told you Sunny's cuts are engaging!", anim: 'cheer', expr: 'happy', priority: 7 },
    { text: "You're back! Ready for the next section?", anim: 'salute', expr: 'excited', priority: 7 },
    { text: "I kept your spot warm right here.", anim: 'dance', expr: 'shy', priority: 7 },
    { text: "Tab restored! Let's continue the grand tour.", anim: 'wave', expr: 'happy', priority: 7 },
  ],
  section_contact: [
    { text: "Say hi! I promise he replies quickly.", anim: 'wave', expr: 'happy' },
    { text: "Don't be shy, great connections start with a hello.", anim: 'dance', expr: 'flirty' },
    { text: "Collaboration? Sunny is always open to ideas.", anim: 'salute', expr: 'focused' },
    { text: "Drop a line! You won't regret reaching out.", anim: 'cheer', expr: 'excited' },
    { text: "The inbox is waiting. Make his day!", anim: 'wave', expr: 'happy' },
  ],
  idle_reading: [
    { text: "Reading every word? Respect. I like attentive people.", anim: 'idle', expr: 'flirty' },
    { text: "You read slowly. I like people who savour things.", anim: 'idle', expr: 'curious' },
    { text: "Don't mind me, I'm just admiring you from over here.", anim: 'idle', expr: 'shy' },
    { text: "Take your time. I could stay right here all day.", anim: 'idle', expr: 'happy' },
    { text: "Studying the fine print? Thorough. Very attractive.", anim: 'salute', expr: 'proud' },
  ],
  card_hover: [
    { text: "Ooh, that one is cute. The project, I mean... and you.", anim: 'jump', expr: 'flirty' },
    { text: "Good taste. Clearly.", anim: 'salute', expr: 'proud' },
    { text: "That project is one of my personal favorites.", anim: 'cheer', expr: 'happy' },
    { text: "Ooh, sharp eye. That one has top-tier polish.", anim: 'idle', expr: 'curious' },
    { text: "Click it! I promise it's worth exploring.", anim: 'wave', expr: 'excited' },
  ],
  click_contact: [
    { text: "Bold move. I respect confidence.", anim: 'cheer', expr: 'flirty', priority: 5 },
    { text: "Taking the leap? I love decisive action.", anim: 'salute', expr: 'excited', priority: 5 },
    { text: "Let's make something amazing together!", anim: 'jump', expr: 'happy', priority: 5 },
    { text: "Fast-tracking to the chat. Good call.", anim: 'wave', expr: 'proud', priority: 5 },
    { text: "Smooth navigation. Right to the point.", anim: 'dance', expr: 'flirty', priority: 5 },
  ],
  click_resume: [
    { text: "Resume saved! Now you can admire it offline.", anim: 'salute', expr: 'flirty', priority: 6 },
    { text: "Resume in hand. Offline admiring authorized!", anim: 'cheer', expr: 'proud', priority: 6 },
    { text: "Adding Sunny to your roster? Excellent choice.", anim: 'jump', expr: 'excited', priority: 6 },
    { text: "Official credentials downloaded. Impressed yet?", anim: 'dance', expr: 'happy', priority: 6 },
    { text: "Download complete. Now call him for an interview!", anim: 'wave', expr: 'flirty', priority: 6 },
  ],
  copy_email: [
    { text: "Email copied. Don't be shy, say hi.", anim: 'wave', expr: 'flirty', priority: 6 },
    { text: "Email on clipboard. Now send something clever!", anim: 'cheer', expr: 'excited', priority: 6 },
    { text: "Direct line secured. Can't wait to hear from you.", anim: 'salute', expr: 'happy', priority: 6 },
    { text: "Copied! You're one step away from connecting.", anim: 'jump', expr: 'proud', priority: 6 },
    { text: "Email locked in. Make the greeting count!", anim: 'dance', expr: 'flirty', priority: 6 },
  ],
  skills_filter: [
    { text: "Filtering like a pro. Decisive. Attractive.", anim: 'salute', expr: 'flirty' },
    { text: "Sorting through the tech stack. Decisive eye.", anim: 'idle', expr: 'curious' },
    { text: "Frontend? Backend? Blockchain? Why not all three?", anim: 'cheer', expr: 'proud' },
    { text: "Dialing in on the exact right skills.", anim: 'jump', expr: 'focused' },
    { text: "Custom view unlocked. Look at all those tools.", anim: 'wave', expr: 'happy' },
  ],
  skills_chip_click: [
    { text: "Mmm, solid tech choice.", anim: 'salute', expr: 'proud' },
    { text: "A personal favorite in the toolbelt.", anim: 'idle', expr: 'curious' },
    { text: "Rock solid stack! Production tested.", anim: 'cheer', expr: 'happy' },
    { text: "Fast, responsive and elegant.", anim: 'dance', expr: 'flirty' },
    { text: "Great tool! Sunny knows it inside out.", anim: 'salute', expr: 'focused' },
  ],
  chip_hover: [
    { text: "Mmm, good choice.", anim: 'idle', expr: 'flirty' },
    { text: "A personal favorite in the toolbelt.", anim: 'salute', expr: 'proud' },
    { text: "Rock solid tech. Production-tested.", anim: 'cheer', expr: 'happy' },
    { text: "Fast, responsive and elegant. Just like me.", anim: 'dance', expr: 'proud' },
    { text: "Great tool. Sunny knows it inside out.", anim: 'wave', expr: 'focused' },
  ],
  rail_hover: [
    { text: "Taking the shortcut? Smart.", anim: 'jump', expr: 'curious' },
    { text: "Speed-running the portfolio? I like your efficiency.", anim: 'salute', expr: 'flirty' },
    { text: "Navigating with style. Lead the way!", anim: 'wave', expr: 'happy' },
    { text: "Jumping ahead? Don't leave me behind!", anim: 'dance', expr: 'excited' },
    { text: "Direct hop. Clean and efficient.", anim: 'cheer', expr: 'proud' },
  ],
  palette_open: [
    { text: "A keyboard shortcut person? Be still my antenna.", anim: 'jump', expr: 'flirty', priority: 7 },
    { text: "Power user detected! My favorite kind.", anim: 'salute', expr: 'proud', priority: 7 },
    { text: "Command palette opened. You know your way around!", anim: 'cheer', expr: 'excited', priority: 7 },
    { text: "Shortcuts over clicks? Instantly attractive.", anim: 'dance', expr: 'flirty', priority: 7 },
    { text: "Commanding the interface like a pro.", anim: 'wave', expr: 'happy', priority: 7 },
  ],
  palette_close: [
    { text: "Back already? I was enjoying the company.", anim: 'wave', expr: 'flirty', priority: 4 },
    { text: "Command executed. Back to the show!", anim: 'salute', expr: 'happy', priority: 4 },
    { text: "Quick on the keys. Fast and decisive.", anim: 'cheer', expr: 'proud', priority: 4 },
    { text: "Returned to base. What are we exploring next?", anim: 'idle', expr: 'curious', priority: 4 },
    { text: "Welcome back to the main view.", anim: 'dance', expr: 'happy', priority: 4 },
  ],
  fast_scroll: [
    { text: "Whoa, slow down. You're making me dizzy. Or is that you?", anim: 'dizzy', expr: 'dizzy', priority: 8 },
    { text: "Speedy scrolling! Hold onto your pixels!", anim: 'dizzy', expr: 'dizzy', priority: 8 },
    { text: "Fast wheels! I'm holding onto my antenna!", anim: 'jump', expr: 'excited', priority: 8 },
    { text: "Racing through? I'll do my best to keep up!", anim: 'walk', expr: 'flirty', priority: 8 },
    { text: "Warp speed engaged! Careful around the turns!", anim: 'cheer', expr: 'happy', priority: 8 },
  ],
  back_to_top: [
    { text: "Leaving already? Fine, I'll race you up.", anim: 'jump', expr: 'flirty', priority: 7 },
    { text: "Rocketing back to home base! Made it!", anim: 'cheer', expr: 'excited', priority: 7 },
    { text: "Back at the summit. What a ride!", anim: 'salute', expr: 'happy', priority: 7 },
    { text: "Second lap? I'm always up for another run.", anim: 'dance', expr: 'flirty', priority: 7 },
    { text: "Home sweet home. Did you forget something?", anim: 'wave', expr: 'curious', priority: 7 },
  ],
  click_steve: [
    { text: "Hey, that tickles. Buy me dinner first.", anim: 'jump', expr: 'flirty', priority: 9 },
    { text: "Careful, I'm blushing.", anim: 'idle', expr: 'shy', priority: 9 },
    { text: "Hey! My circuits are sensitive, you know.", anim: 'jump', expr: 'curious', priority: 9 },
    { text: "Poke me again and I might just spin around.", anim: 'dance', expr: 'flirty', priority: 9 },
    { text: "Hands off the antenna! Okay, you can pat it once.", anim: 'cheer', expr: 'happy', priority: 9 },
  ],
  click_steve_overheat: [
    { text: "Okay okay, I'm overheating!", anim: 'spin', expr: 'dizzy', priority: 12 },
    { text: "System temp critical! Deploying cooling vents!", anim: 'spin', expr: 'dizzy', priority: 12 },
    { text: "Too many clicks! High voltage alert!", anim: 'spin', expr: 'dizzy', priority: 12 },
    { text: "Steam vents open! Phew, that was intense!", anim: 'spin', expr: 'dizzy', priority: 12 },
    { text: "Overheat cooldown initiated! Nice finger speed!", anim: 'spin', expr: 'dizzy', priority: 12 },
  ],
  shy_pickup: [
    { text: "Are you a CSS grid? You align everything in my life.", anim: 'idle', expr: 'flirty' },
    { text: "Is your name Git? Because I want to commit.", anim: 'idle', expr: 'flirty' },
    { text: "You must be a semicolon; you complete my line.", anim: 'idle', expr: 'flirty' },
    { text: "Are you an API? I can't stop calling you.", anim: 'idle', expr: 'flirty' },
    { text: "Are you Wi-Fi? I'm feeling a connection.", anim: 'idle', expr: 'flirty' },
    { text: "Are you my cache? I keep coming back to you.", anim: 'idle', expr: 'flirty' },
    { text: "If you were a function, you'd be pure: no side effects.", anim: 'idle', expr: 'flirty' },
    { text: "Is your name Ctrl+S? Because I'd save you.", anim: 'idle', expr: 'flirty' },
    { text: "You must be a Promise, because I'm waiting for you.", anim: 'idle', expr: 'flirty' },
    { text: "I'd never 404 on you.", anim: 'idle', expr: 'flirty' },
  ],
};

class SteveVoiceEngine {
  private lastSpeakTime = 0;
  private minuteCount = 0;
  private minuteTimer: ReturnType<typeof setInterval> | null = null;
  private usedIndices: Record<string, Set<number>> = {};
  private pendingLine: { line: VoiceLine; duration: number } | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.minuteTimer = setInterval(() => {
        this.minuteCount = 0;
      }, 60000);
    }
  }

  public destroy(): void {
    if (this.minuteTimer) {
      clearInterval(this.minuteTimer);
      this.minuteTimer = null;
    }
  }

  /**
   * Trigger Steve to speak a category line with rate limiting,
   * priority replacement, and no repetition until pool exhausted.
   */
  public speak(category: VoiceCategory, customDuration?: number) {
    if (typeof document === 'undefined') return;

    // Never speak in quiet mode or when disabled
    const state = robotStore.getState();
    if (!state.robotEnabled || state.isQuiet) return;

    // Never speak while user is typing in form fields
    const active = document.activeElement;
    if (active) {
      const tag = active.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (active as HTMLElement).isContentEditable) {
        return;
      }
    }

    const pool = VOICE_POOLS[category];
    if (!pool || pool.length === 0) return;

    // Select index with no repeats until exhausted
    if (!this.usedIndices[category]) {
      this.usedIndices[category] = new Set();
    }
    const used = this.usedIndices[category];
    if (used.size >= pool.length) {
      used.clear();
    }

    const available = [];
    for (let i = 0; i < pool.length; i++) {
      if (!used.has(i)) available.push(i);
    }
    const chosenIndex = available[Math.floor(Math.random() * available.length)];
    used.add(chosenIndex);

    const line = pool[chosenIndex];
    const priority = line.priority || 1;
    const now = Date.now();
    const duration = customDuration || 3200;

    // Rate limits: >= 3000ms between lines, max ~6/minute
    const timeSinceLast = now - this.lastSpeakTime;
    const withinRate = timeSinceLast >= 3000 && this.minuteCount < 7;

    if (withinRate) {
      this.dispatchLine(line, duration);
    } else {
      // Priority queue of length 1: higher priority line replaces waiting line
      if (!this.pendingLine || priority > (this.pendingLine.line.priority || 1)) {
        this.pendingLine = { line, duration };
        const waitMs = Math.max(500, 3100 - timeSinceLast);
        setTimeout(() => {
          if (this.pendingLine && this.pendingLine.line === line) {
            this.dispatchLine(line, duration);
            this.pendingLine = null;
          }
        }, waitMs);
      }
    }
  }

  private dispatchLine(line: VoiceLine, duration: number) {
    this.lastSpeakTime = Date.now();
    this.minuteCount++;

    if (line.anim && line.expr) {
      robotStore.setSteve(line.anim, line.expr);
    }
    // Truncate cleanly to at most 60 characters
    const text = line.text.slice(0, 60);
    robotStore.showSpeechBubble(text, duration);
  }
}

export const steveVoice = new SteveVoiceEngine();

if (typeof window !== 'undefined') {
  (window as unknown as { steveVoice: typeof steveVoice }).steveVoice = steveVoice;
}
