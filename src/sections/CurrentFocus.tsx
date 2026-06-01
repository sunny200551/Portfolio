import React from 'react';
import { SpotlightCard } from '../components/SpotlightCard';
import { Server, Shield, Layers, Workflow, Binary } from 'lucide-react';
import { motion } from 'framer-motion';

interface FocusItem {
  title: string;
  icon: React.ElementType;
  description: string;
  subItems: string[];
  color: string;
}

const focusItems: FocusItem[] = [
  {
    title: 'Full Stack Development',
    icon: Server,
    description: 'Constructing performant web app cycles, handling both client states and robust database/api server networks.',
    subItems: ['Vite + React + TS', 'Node / Express APIs', 'Realtime Sync (Firestore)'],
    color: 'border-cyan-500/20 text-cyan-400'
  },
  {
    title: 'Blockchain Technologies',
    icon: Shield,
    description: 'Analyzing blockchain ledger architectures, cryptographic hashing keys, and basic smart contract design paradigms.',
    subItems: ['Distributed Ledgers', 'Web3 Connectors', 'Contract Cryptography'],
    color: 'border-violet-500/20 text-violet-400'
  },
  {
    title: 'Data Structures & Algorithms',
    icon: Binary,
    description: 'Strengthening algorithmic problem solving and memory/execution runtime efficiencies.',
    subItems: ['Time Complexities', 'Tree & Graph Traversal', 'Search & Optimization'],
    color: 'border-pink-500/20 text-pink-400'
  },
  {
    title: 'System Design',
    icon: Workflow,
    description: 'Designing system flow components, API layers, cache servers, and database schemas.',
    subItems: ['Client-Server Models', 'Micro-flows / REST', 'Database Schemas'],
    color: 'border-amber-500/20 text-amber-400'
  },
  {
    title: 'Software Engineering',
    icon: Layers,
    description: 'Applying Agile cycles, clean coding structures, version controls, and continuous integration paths.',
    subItems: ['Semantic Git Flow', 'Modern ESLint Specs', 'Modular Architecture'],
    color: 'border-emerald-500/20 text-emerald-400'
  }
];

export const CurrentFocus: React.FC = () => {
  return (
    <section id="focus" className="py-24 px-4 max-w-6xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-300 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Current Focus
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
          Academic Roadmaps & Specializations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {focusItems.map((item, idx) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`${
                idx < 2 ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
            >
              <SpotlightCard className="h-full flex flex-col justify-between p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-zinc-900 border ${item.color} flex items-center justify-center`}>
                      <Icon size={16} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-200">{item.title}</h3>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-white/5">
                  {item.subItems.map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                      <span className="w-1 h-1 rounded-full bg-violet-400" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
export default CurrentFocus;
