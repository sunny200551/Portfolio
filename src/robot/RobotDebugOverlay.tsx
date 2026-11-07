import React, { useState, useEffect } from 'react';
import { robotStore, type RobotState } from './robotStore';

export const RobotDebugOverlay: React.FC = () => {
  const [state, setState] = useState<RobotState>(() => robotStore.getState());
  const [steveCount, setSteveCount] = useState(1);

  useEffect(() => {
    if (!state.isDebug) return;
    const unsubscribe = robotStore.subscribe(() => {
      setState({ ...robotStore.getState() });
    });
    return () => unsubscribe();
  }, [state.isDebug]);

  // Assert exactly ONE STEVE on site
  useEffect(() => {
    if (!state.isDebug) return;
    const interval = setInterval(() => {
      const count = document.querySelectorAll('[data-robot-instance="single-steve"]').length;
      setSteveCount(count);
      if (count !== 1) {
        console.error(`[ROBOT ASSERTION VIOLATION] Expected exactly 1 STEVE on site, found ${count}!`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.isDebug]);

  if (!state.isDebug) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white/95 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] font-mono text-xs text-[#0A0A0A] pointer-events-auto max-w-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#0A0A0A] font-bold">
        <span className="text-[#FF5A1F]">ROBOT DEBUG (?robotDebug=1)</span>
        <span className={`text-[10px] px-1.5 py-0.5 ${steveCount === 1 ? 'bg-[#0047AB]' : 'bg-red-600'} text-white`}>
          {steveCount === 1 ? '1 STEVE (OK)' : `VIOLATION: ${steveCount} STEVES`}
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div>
          <strong className="text-[#0047AB]">SINGLE STEVE:</strong> anim=
          <span className="font-bold text-[#FF5A1F] ml-1">{state.steveAnim}</span> | expr=
          <span className="font-bold ml-1">{state.steveExpr}</span>
        </div>
        <div className="text-[10px] text-[#0A0A0A]/80">
          <div>Lane: <span className="font-bold uppercase text-[#FF5A1F]">{state.activeSection}</span></div>
          <div>Instances count: <span className="font-bold">{steveCount}</span> (Exactly 1 required)</div>
        </div>
        <div className="pt-2 border-t border-[#0A0A0A]/20 text-[10px] text-[#0A0A0A]/70">
          <div>Cursor: X={state.cursor.x.toFixed(2)}, Y={state.cursor.y.toFixed(2)}</div>
          <div>STEVE Screen: X={state.steveScreenPos.x.toFixed(0)}, Y={state.steveScreenPos.y.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
};

export default RobotDebugOverlay;
