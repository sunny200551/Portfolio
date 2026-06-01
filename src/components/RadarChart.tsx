import React from 'react';
import { motion } from 'framer-motion';

interface RadarData {
  subject: string;
  value: number; // 0 - 100
  fullMark: number;
}

const radarData: RadarData[] = [
  { subject: 'Languages', value: 90, fullMark: 100 },
  { subject: 'Frontend', value: 85, fullMark: 100 },
  { subject: 'Backend', value: 80, fullMark: 100 },
  { subject: 'Database', value: 75, fullMark: 100 },
  { subject: 'Blockchain', value: 70, fullMark: 100 },
  { subject: 'Tools & Git', value: 85, fullMark: 100 }
];

export const RadarChart: React.FC = () => {
  const size = 420;
  const center = size / 2;
  const radius = size * 0.28;
  const angleStep = (Math.PI * 2) / radarData.length;

  // Calculate coordinates for a given index and value (0-100)
  const getCoordinates = (index: number, val: number) => {
    const angle = angleStep * index - Math.PI / 2; // Subtract PI/2 to start at top center
    const x = center + radius * (val / 100) * Math.cos(angle);
    const y = center + radius * (val / 100) * Math.sin(angle);
    return { x, y };
  };

  // Generate grid lines coordinates (5 concentric levels)
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPoints = gridLevels.map(level => {
    return radarData.map((_, idx) => getCoordinates(idx, level));
  });

  // Calculate path for Sunny's values
  const dataPoints = radarData.map((d, idx) => getCoordinates(idx, d.value));
  const dataPathString = dataPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Calculate coordinates for labels (slightly further out than radius)
  const labelPoints = radarData.map((d, idx) => {
    const angle = angleStep * idx - Math.PI / 2;
    const x = center + (radius + 28) * Math.cos(angle);
    const y = center + (radius + 16) * Math.sin(angle);
    return { x, y, subject: d.subject, val: d.value };
  });

  return (
    <div className="w-full flex items-center justify-center p-2 relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[280px] sm:max-w-[320px] aspect-square drop-shadow-[0_0_15px_rgba(99,102,241,0.15)] overflow-visible"
      >
        {/* Glow Filters */}
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Outer background glow */}
        <circle cx={center} cy={center} r={radius} fill="url(#radarGlow)" />

        {/* Concentric grid lines */}
        {gridPoints.map((points, idx) => {
          const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return (
            <path
              key={idx}
              d={path}
              className="radar-grid-line"
              fill="none"
            />
          );
        })}

        {/* Axis lines */}
        {radarData.map((_, idx) => {
          const outer = getCoordinates(idx, 100);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              className="radar-axis-line"
            />
          );
        })}

        {/* Animated Skill Polygon */}
        <motion.path
          d={dataPathString}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="rgb(168, 85, 247)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Active Points */}
        {dataPoints.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-cyan-400 stroke-zinc-950 dark:stroke-zinc-100"
              strokeWidth="1.5"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r="8"
              className="fill-cyan-400/30 animate-ping pointer-events-none"
            />
          </g>
        ))}

        {/* Labels */}
        {labelPoints.map((p, idx) => {
          // Adjust text alignment based on coordinates
          let textAnchor: "inherit" | "end" | "middle" | "start" = 'middle';
          if (p.x < center - 10) textAnchor = 'end';
          if (p.x > center + 10) textAnchor = 'start';
          
          return (
            <g key={idx}>
              <text
                x={p.x}
                y={p.y}
                textAnchor={textAnchor}
                className="text-[10px] sm:text-[11px] font-semibold fill-zinc-400 light:fill-zinc-700 font-mono uppercase tracking-wider"
              >
                {p.subject}
              </text>
              <text
                x={p.x}
                y={p.y + 11}
                textAnchor={textAnchor}
                className="text-[9px] font-mono fill-violet-400/80 light:fill-violet-600/80 font-bold"
              >
                {p.val}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
export default RadarChart;
