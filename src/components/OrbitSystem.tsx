import React from 'react';
import { Shield, Database, Cpu, Globe, Key, Flame } from 'lucide-react';

export const OrbitSystem: React.FC = () => {
  return (
    <div className="relative w-full h-[280px] sm:h-[350px] flex items-center justify-center overflow-hidden">
      {/* Glow Center */}
      <div className="absolute w-[200px] h-[200px] rounded-full bg-violet-600/10 dark:bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Orbit 1 (Inner) - Orbit Animation */}
      <div 
        className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-violet-500/30 flex items-center justify-center"
        style={{
          animation: 'orbit 25s linear infinite',
          willChange: 'transform',
        }}
      >
        {/* Node 1: HTML / CSS */}
        <div 
          className="absolute -top-3 w-8 h-8 rounded-full bg-slate-900/90 border border-cyan-400/40 flex items-center justify-center shadow-lg group cursor-pointer hover:border-cyan-400 hover:scale-110 transition-all"
          style={{ transform: 'rotate(0deg)' }}
          title="HTML / CSS"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="absolute left-10 scale-0 group-hover:scale-100 bg-black/80 text-white text-[10px] py-1 px-2 rounded border border-white/10 font-mono transition-all z-20 whitespace-nowrap">
            Frontend: HTML & CSS
          </span>
        </div>

        {/* Node 2: Database / Firestore */}
        <div 
          className="absolute -bottom-3 w-8 h-8 rounded-full bg-slate-900/90 border border-amber-500/40 flex items-center justify-center shadow-lg group cursor-pointer hover:border-amber-500 hover:scale-110 transition-all"
          style={{ transform: 'rotate(120deg)' }}
          title="Firestore / Databases"
        >
          <Database className="w-4 h-4 text-amber-500" />
          <span className="absolute left-10 scale-0 group-hover:scale-100 bg-black/80 text-white text-[10px] py-1 px-2 rounded border border-white/10 font-mono transition-all z-20 whitespace-nowrap">
            Database: Firestore
          </span>
        </div>

        {/* Node 3: Node.js */}
        <div 
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/90 border border-green-500/40 flex items-center justify-center shadow-lg group cursor-pointer hover:border-green-500 hover:scale-110 transition-all"
          style={{ transform: 'rotate(240deg)' }}
          title="Node.js"
        >
          <Cpu className="w-4 h-4 text-green-500" />
          <span className="absolute left-10 scale-0 group-hover:scale-100 bg-black/80 text-white text-[10px] py-1 px-2 rounded border border-white/10 font-mono transition-all z-20 whitespace-nowrap">
            Backend: Node.js
          </span>
        </div>
      </div>

      {/* Orbit 2 (Outer) - Counter Rotation */}
      <div 
        className="absolute w-[260px] h-[260px] rounded-full border border-dashed border-cyan-500/20 flex items-center justify-center"
        style={{
          animation: 'orbit 40s linear infinite reverse',
          willChange: 'transform',
        }}
      >
        {/* Node 1: Blockchain smart contracts */}
        <div 
          className="absolute -top-3 w-8 h-8 rounded-full bg-slate-900/90 border border-purple-500/40 flex items-center justify-center shadow-lg group cursor-pointer hover:border-purple-500 hover:scale-110 transition-all"
          style={{ transform: 'rotate(0deg)' }}
          title="Web3 & Smart Contracts"
        >
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="absolute left-10 scale-0 group-hover:scale-100 bg-black/80 text-white text-[10px] py-1 px-2 rounded border border-white/10 font-mono transition-all z-20 whitespace-nowrap">
            Web3 & Smart Contracts
          </span>
        </div>

        {/* Node 2: Firebase */}
        <div 
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/90 border border-orange-500/40 flex items-center justify-center shadow-lg group cursor-pointer hover:border-orange-500 hover:scale-110 transition-all"
          style={{ transform: 'rotate(90deg)' }}
          title="Firebase Hosting"
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="absolute left-10 scale-0 group-hover:scale-100 bg-black/80 text-white text-[10px] py-1 px-2 rounded border border-white/10 font-mono transition-all z-20 whitespace-nowrap">
            Firebase Cloud Systems
          </span>
        </div>

        {/* Node 3: Security / Smart contracts cryptography */}
        <div 
          className="absolute bottom-1 right-8 w-8 h-8 rounded-full bg-slate-900/90 border border-blue-500/40 flex items-center justify-center shadow-lg group cursor-pointer hover:border-blue-500 hover:scale-110 transition-all"
          style={{ transform: 'rotate(180deg)' }}
          title="Git & Version Control"
        >
          <Key className="w-4 h-4 text-blue-400" />
          <span className="absolute left-10 scale-0 group-hover:scale-100 bg-black/80 text-white text-[10px] py-1 px-2 rounded border border-white/10 font-mono transition-all z-20 whitespace-nowrap">
            Security & Crypto Concepts
          </span>
        </div>

        {/* Node 4: Git/Tools */}
        <div 
          className="absolute bottom-4 left-8 w-8 h-8 rounded-full bg-slate-900/90 border border-rose-500/40 flex items-center justify-center shadow-lg group cursor-pointer hover:border-rose-500 hover:scale-110 transition-all"
          style={{ transform: 'rotate(270deg)' }}
          title="Development Tools"
        >
          <Cpu className="w-4 h-4 text-rose-400" />
          <span className="absolute left-10 scale-0 group-hover:scale-100 bg-black/80 text-white text-[10px] py-1 px-2 rounded border border-white/10 font-mono transition-all z-20 whitespace-nowrap">
            Tools: Git & VS Code
          </span>
        </div>
      </div>

      {/* Central Core */}
      <div className="absolute w-[80px] h-[80px] rounded-full glassmorphism flex flex-col items-center justify-center border border-white/15 shadow-2xl z-10 animate-float">
        <span className="text-[14px] font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-mono">
          CSE
        </span>
        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
          CORE
        </span>
      </div>
    </div>
  );
};
export default OrbitSystem;
