import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot } from './Robot';
import type { RobotExpression, RobotAnimation } from './types';

const ALL_EXPRESSIONS: RobotExpression[] = [
  'happy',
  'grin',
  'laughing',
  'wink',
  'curious',
  'excited',
  'mind-blown',
  'smug',
  'silly',
  'dizzy',
  'focused',
  'sleepy',
];

const SHOWCASE_POSES: { label: string; anim: RobotAnimation; expr: RobotExpression; desc: string }[] = [
  { label: 'POSE 1: REST IDLE', anim: 'idle', expr: 'happy', desc: 'Arms angled 18° outward away from torso' },
  { label: 'POSE 2: HIGH WAVE', anim: 'wave', expr: 'excited', desc: 'Right arm raised high, waving outside body' },
  { label: 'POSE 3: MILITARY SALUTE', anim: 'salute', expr: 'focused', desc: 'Right hand to temple, elbow bent outward' },
  { label: 'POSE 4: CELEBRATION CHEER', anim: 'cheer', expr: 'laughing', desc: 'Both arms raised up in celebration \\o/' },
  { label: 'POSE 5: BICEP FLEX', anim: 'flex', expr: 'grin', desc: 'Both arms flexed outside torso, zero collision' },
  { label: 'POSE 6: PLAYFUL SHRUG', anim: 'shrug', expr: 'curious', desc: 'Arms bent up, palms out to sides' },
];

export const RobotShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'expressions' | 'poses' | 'variants'>('expressions');

  return (
    <div className="fixed inset-0 z-50 bg-[#EEF2FA] text-[#0A0A0A] overflow-y-auto p-6 sm:p-10 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b-2 border-[#0A0A0A] gap-4">
          <div>
            <div className="text-xs font-bold px-2 py-0.5 bg-[#FF5A1F] text-black inline-block border border-[#0A0A0A] uppercase mb-2">
              ROBOT SYSTEM // VERIFICATION SUITE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#0A0A0A]">
              BOLT, NUT & CHIP SHOWCASE
            </h1>
          </div>

          <div className="flex gap-2">
            {(['expressions', 'poses', 'variants'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
                className={`px-3 py-1.5 text-xs font-bold uppercase border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] ${
                  activeTab === tab ? 'bg-[#0047AB] text-white' : 'bg-white text-black'
                }`}
              >
                {tab}
              </button>
            ))}
            <a
              href="/"
              className="px-3 py-1.5 text-xs font-bold uppercase bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#FF5A1F]"
            >
              Back to Site
            </a>
          </div>
        </div>

        {/* 1. All 12 Expressions Showcase */}
        {activeTab === 'expressions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase text-[#0A0A0A]">
                ALL 12 VISOR EXPRESSIONS (LARGE EYES, EYEBROWS & MOUTH)
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-white border border-[#0A0A0A]">
                NO SAD / ANGRY EXPRESSIONS
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ALL_EXPRESSIONS.map((expr) => (
                <div
                  key={expr}
                  data-testid={`expr-card-${expr}`}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-3 flex flex-col items-center"
                >
                  <div className="w-full h-44 bg-[#EEF2FA] border border-[#0A0A0A] relative">
                    <Canvas
                      orthographic
                      camera={{ position: [0, 0.42, 3], zoom: 140 }}
                      gl={{ alpha: true }}
                    >
                      <ambientLight intensity={1.2} />
                      <directionalLight position={[3, 5, 4]} intensity={1.5} />
                      <Robot
                        variant="bolt"
                        expression={expr}
                        animation="idle"
                        position={[0, -0.34, 0]}
                        scale={0.9}
                        headTrackCursor={false}
                      />
                    </Canvas>
                  </div>
                  <span className="mt-2 text-xs font-bold uppercase text-[#0A0A0A]">
                    {expr}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. 6 Arm Poses Close-Up */}
        {activeTab === 'poses' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase text-[#0A0A0A]">
                6 ARM POSES (SHOULDER OUTSIDE TORSO, CLAMPED ROTATIONS, VISIBLE MITTENS)
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-white border border-[#0A0A0A]">
                ZERO COLLISION WITH BODY
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SHOWCASE_POSES.map((pose, idx) => (
                <div
                  key={idx}
                  data-testid={`pose-card-${idx}`}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-4 flex flex-col items-center"
                >
                  <div className="w-full h-64 bg-[#EEF2FA] border border-[#0A0A0A] relative">
                    <Canvas
                      orthographic
                      camera={{ position: [0, 0.38, 3], zoom: 125 }}
                      gl={{ alpha: true }}
                    >
                      <ambientLight intensity={1.2} />
                      <directionalLight position={[3, 5, 4]} intensity={1.5} />
                      <Robot
                        variant="bolt"
                        expression={pose.expr}
                        animation={pose.anim}
                        position={[0, -0.32, 0]}
                        scale={0.9}
                        headTrackCursor={false}
                      />
                    </Canvas>
                  </div>
                  <span className="mt-3 text-xs font-bold uppercase text-[#0A0A0A]">
                    {pose.label}
                  </span>
                  <span className="text-[11px] text-gray-600 mt-1 text-center">
                    {pose.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Three Robot Variants */}
        {activeTab === 'variants' && (
          <div>
            <h2 className="text-sm font-bold uppercase mb-4 text-[#0A0A0A]">
              THE TRIO: BOLT (ORANGE), NUT (GREY), CHIP (NAVY)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(['bolt', 'nut', 'chip'] as const).map((variant) => (
                <div
                  key={variant}
                  data-testid={`variant-card-${variant}`}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-4 flex flex-col items-center"
                >
                  <div className="w-full h-64 bg-[#EEF2FA] border border-[#0A0A0A] relative">
                    <Canvas
                      orthographic
                      camera={{ position: [0, 0.35, 3], zoom: 120 }}
                      gl={{ alpha: true }}
                    >
                      <ambientLight intensity={1.2} />
                      <directionalLight position={[3, 5, 4]} intensity={1.5} />
                      <Robot
                        variant={variant}
                        expression="happy"
                        animation="wave"
                        position={[0, -0.28, 0]}
                        headTrackCursor={false}
                      />
                    </Canvas>
                  </div>
                  <span className="mt-3 text-sm font-bold uppercase text-[#0A0A0A]">
                    {variant.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600 mt-1">
                    {variant === 'bolt' ? 'Main Guide Mascot' : variant === 'nut' ? 'Playful Friend' : 'Tech Specialist'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RobotShowcase;
