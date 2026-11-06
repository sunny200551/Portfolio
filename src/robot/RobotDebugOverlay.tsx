import React, { useState, useEffect } from 'react';
import { robotStore, type RobotState } from './robotStore';

export const RobotDebugOverlay: React.FC = () => {
  const [state, setState] = useState<RobotState>(() => robotStore.getState());

  useEffect(() => {
    if (!state.isDebug) return;
    const unsubscribe = robotStore.subscribe(() => {
      setState({ ...robotStore.getState() });
    });
    return () => unsubscribe();
  }, [state.isDebug]);

  if (!state.isDebug) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white/95 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] font-mono text-xs text-[#0A0A0A] pointer-events-auto max-w-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#0A0A0A] font-bold">
        <span className="text-[#FF5A1F]">ROBOT DEBUG (?robotDebug=1)</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-[#0047AB] text-white">LIVE</span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div>
          <strong className="text-[#0047AB]">BOLT:</strong> scale=1.25 (target &ge; 110px) | anim=
          <span className="font-bold text-[#FF5A1F]">{state.boltAnim}</span> | expr=
          <span className="font-bold">{state.boltExpr}</span>
        </div>
        <div>
          <strong className="text-[#0047AB]">NUT:</strong> scale=0.72 (target &ge; 70px) | anim=
          <span>{state.nutAnim}</span> (kicking cube)
        </div>
        <div>
          <strong className="text-[#0047AB]">CHIP:</strong> scale=0.68 (target &ge; 70px) | anim=
          <span>{state.chipAnim}</span> | expr=
          <span>{state.chipExpr}</span>
        </div>
        <div className="pt-2 border-t border-[#0A0A0A]/20 text-[10px] text-[#0A0A0A]/70">
          <div>Cursor: X={state.cursor.x.toFixed(2)}, Y={state.cursor.y.toFixed(2)}</div>
          <div>BOLT Screen: X={state.boltScreenPos.x.toFixed(0)}, Y={state.boltScreenPos.y.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
};

export default RobotDebugOverlay;

