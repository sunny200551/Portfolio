import React, { useState } from 'react';
import type { CalendarWeek } from '../../lib/github';

interface Flat2DContributionGridProps {
  weeks: CalendarWeek[];
}

const levelColorMap: Record<string, string> = {
  NONE: '#EEF2FA',
  FIRST_QUARTILE: '#7BA4E8',
  SECOND_QUARTILE: '#0047AB',
  THIRD_QUARTILE: '#0A1A3F',
  FOURTH_QUARTILE: '#FF5A1F',
};

export const Flat2DContributionGrid: React.FC<Flat2DContributionGridProps> = ({ weeks }) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Take the last 52 weeks
  const displayWeeks = weeks.slice(-52);

  // Derive month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = '';

  displayWeeks.forEach((week, wIdx) => {
    const firstDay = week.contributionDays[0];
    if (firstDay && firstDay.date) {
      const monthStr = new Date(firstDay.date).toLocaleString('default', { month: 'short' }).toUpperCase();
      if (monthStr !== lastMonth) {
        monthLabels.push({ label: monthStr, weekIndex: wIdx });
        lastMonth = monthStr;
      }
    }
  });

  return (
    <div className="w-full h-full p-4 bg-white flex flex-col justify-center items-center select-none relative overflow-x-auto">
      {/* Tooltip */}
      {hoveredDay && (
        <div
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y}px`,
          }}
          className="fixed pointer-events-none z-50 px-2.5 py-1 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-mono text-xs font-bold text-[#0A0A0A] -translate-x-1/2 -translate-y-full -mt-2"
        >
          <span className="text-[#0047AB]">{hoveredDay.date}</span>: {hoveredDay.count} {hoveredDay.count === 1 ? 'commit' : 'commits'}
        </div>
      )}

      <div className="inline-block">
        {/* Month Labels */}
        <div className="flex text-[9px] font-mono font-bold text-[#0A0A0A]/70 mb-1 pl-6">
          {displayWeeks.map((_, i) => {
            const m = monthLabels.find((ml) => ml.weekIndex === i);
            return (
              <div key={i} className="w-3 text-left">
                {m ? m.label : ''}
              </div>
            );
          })}
        </div>

        {/* Grid rows (Weekdays 0-6: Sun-Sat) */}
        <div className="flex gap-1">
          {/* Weekday indicators */}
          <div className="flex flex-col justify-between text-[9px] font-mono font-bold text-[#0A0A0A]/60 pr-1 h-[98px]">
            <span>SUN</span>
            <span>TUE</span>
            <span>THU</span>
            <span>SAT</span>
          </div>

          {/* 52 columns */}
          <div className="flex gap-[3px]">
            {displayWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.contributionDays.map((day) => {
                  const bg = levelColorMap[day.contributionLevel] || '#EEF2FA';
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          date: day.date,
                          count: day.contributionCount,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{ backgroundColor: bg }}
                      className="w-2.5 h-2.5 border border-[#0A0A0A] transition-transform hover:scale-125 cursor-pointer"
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 font-mono text-[10px] font-bold text-[#0A0A0A]/60 flex items-center gap-2">
        <span>2D FALLBACK GRID // 52 WEEKS</span>
      </div>
    </div>
  );
};

export default Flat2DContributionGrid;

