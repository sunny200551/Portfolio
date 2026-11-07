import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import { robotStore } from '../../robot/robotStore';

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE' | number;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface DayHoverInfo {
  date: string;
  count: number;
  clientX: number;
  clientY: number;
}

interface GitHubSkylineProps {
  weeks: ContributionWeek[];
  onHoverDay?: (info: DayHoverInfo | null) => void;
}

const levelColorMap: Record<number, string> = {
  0: '#EEF2FA', // None
  1: '#7BA4E8', // Light cobalt
  2: '#0047AB', // Solid Cobalt
  3: '#0A1A3F', // Solid Navy
  4: '#FF5A1F', // Orange Peak
};

const SPACING_X = 0.24;
const SPACING_Z = 0.28;

export const GitHubSkyline: React.FC<GitHubSkylineProps> = ({
  weeks,
  onHoverDay,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const lastInteractionTime = useRef(0);
  const isUserInteracting = useRef(false);

  // Fallback 52 weeks generator
  const displayWeeks = useMemo(() => {
    if (weeks && weeks.length >= 52) return weeks.slice(-52);
    if (weeks && weeks.length > 0) return weeks;

    const fallbackWeeks: ContributionWeek[] = [];
    const now = new Date();
    for (let w = 51; w >= 0; w--) {
      const days: ContributionDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(now.getTime() - ((w * 7) + (6 - d)) * 86400000);
        const hash = (w * 7 + d * 13) % 17;
        let count = 0;
        let lvl: ContributionDay['contributionLevel'] = 'NONE';
        if (hash > 8) { count = 1; lvl = 'FIRST_QUARTILE'; }
        if (hash > 11) { count = 3; lvl = 'SECOND_QUARTILE'; }
        if (hash > 14) { count = 6; lvl = 'THIRD_QUARTILE'; }
        if (hash > 15) { count = 10; lvl = 'FOURTH_QUARTILE'; }
        days.push({
          date: dateObj.toISOString().split('T')[0],
          contributionCount: count,
          contributionLevel: lvl,
          weekday: d,
        });
      }
      fallbackWeeks.push({ contributionDays: days });
    }
    return fallbackWeeks;
  }, [weeks]);

  const numWeeks = displayWeeks.length;
  const offsetX = (numWeeks * SPACING_X) / 2;
  const offsetZ = (7 * SPACING_Z) / 2;

  // Flatten bars data
  const { flatBars, maxCount, monthAnchors } = useMemo(() => {
    const bars: {
      key: string;
      weekIdx: number;
      dayIdx: number;
      x: number;
      z: number;
      height: number;
      color: string;
      date: string;
      count: number;
      isToday: boolean;
    }[] = [];

    let highest = 0;
    const months: { name: string; x: number; z: number }[] = [];
    let lastMonth = '';

    displayWeeks.forEach((week, wIdx) => {
      const x = wIdx * SPACING_X - offsetX;
      const days = week.contributionDays;

      days.forEach((day, dIdx) => {
        let numericLevel = 0;
        if (typeof day.contributionLevel === 'number') {
          numericLevel = day.contributionLevel;
        } else if (typeof day.contributionLevel === 'string') {
          switch (day.contributionLevel) {
            case 'FIRST_QUARTILE': numericLevel = 1; break;
            case 'SECOND_QUARTILE': numericLevel = 2; break;
            case 'THIRD_QUARTILE': numericLevel = 3; break;
            case 'FOURTH_QUARTILE': numericLevel = 4; break;
            default: numericLevel = 0;
          }
        } else if (day.contributionCount > 0) {
          numericLevel = Math.min(4, Math.ceil(day.contributionCount / 2));
        }

        const count = day.contributionCount || 0;
        if (count > highest) highest = count;

        const z = dIdx * SPACING_Z - offsetZ;
        const isToday = wIdx === numWeeks - 1 && dIdx === days.length - 1;
        const baseHeight = numericLevel === 0 ? 0.04 : 0.16 + numericLevel * 0.35;

        bars.push({
          key: `${wIdx}-${dIdx}`,
          weekIdx: wIdx,
          dayIdx: dIdx,
          x,
          z,
          height: baseHeight,
          color: levelColorMap[numericLevel] || '#EEF2FA',
          date: day.date,
          count,
          isToday,
        });

        // Collect month boundary for 3D anchored month labels
        if (dIdx === 0 && day.date) {
          const mName = new Date(day.date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
          if (mName !== lastMonth) {
            lastMonth = mName;
            months.push({ name: mName, x, z: offsetZ + 0.35 });
          }
        }
      });
    });

    return { flatBars: bars, maxCount: highest, monthAnchors: months };
  }, [displayWeeks, offsetX, offsetZ, numWeeks]);

  // Gentle auto-rotate: pauses during user interaction, resumes after 4s idle
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const now = Date.now();
    const isIdle = !isUserInteracting.current && now - lastInteractionTime.current > 4000;

    if (isIdle) {
      groupRef.current.rotation.y += delta * 0.08;
      invalidate();
    }
  });

  const notifyUserActivity = useCallback(() => {
    lastInteractionTime.current = Date.now();
    isUserInteracting.current = true;
    invalidate();
  }, [invalidate]);

  // Handle pointer hover on tower
  const handlePointerOver = (e: ThreeEvent<PointerEvent>, bar: (typeof flatBars)[0]) => {
    e.stopPropagation();
    notifyUserActivity();
    setHoveredKey(bar.key);

    if (onHoverDay) {
      onHoverDay({
        date: bar.date,
        count: bar.count,
        clientX: e.clientX,
        clientY: e.clientY,
      });
    }

    // Funny BOLT reaction: cheer for peak tower, curious for others
    if (bar.count > 0 && bar.count >= maxCount - 1) {
      robotStore.setBolt('cheer', 'happy');
    } else {
      robotStore.setBolt('idle', 'curious');
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredKey(null);
    if (onHoverDay) onHoverDay(null);
    robotStore.setBolt('idle', 'happy');
  };

  const baseWidth = offsetX * 2 + 1.2;
  const baseDepth = offsetZ * 2 + 1.1;

  return (
    <group
      ref={groupRef}
      onPointerDown={() => {
        isUserInteracting.current = true;
        notifyUserActivity();
      }}
      onPointerUp={() => {
        isUserInteracting.current = false;
        lastInteractionTime.current = Date.now();
      }}
    >
      {/* Thick Base Slab with Neo-brutalist Edge & Offset Shadow */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[baseWidth, 0.22, baseDepth]} />
        <meshToonMaterial color="#EEF2FA" />
        <Edges threshold={15} color="#0A0A0A" lineWidth={2.5} />
      </mesh>

      {/* Base Plate Shadow Block */}
      <mesh position={[0.15, -0.25, 0.15]}>
        <boxGeometry args={[baseWidth, 0.06, baseDepth]} />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      {/* Clean 3D Weekday Anchored Labels (along left edge) */}
      <Html position={[-offsetX - 0.45, 0.1, -offsetZ + 0.28]} center>
        <div className="font-mono text-[9px] font-bold text-[#0A0A0A] bg-white border border-[#0A0A0A] px-1 shadow-[1px_1px_0px_#0A0A0A] select-none pointer-events-none">
          MON
        </div>
      </Html>
      <Html position={[-offsetX - 0.45, 0.1, 0]} center>
        <div className="font-mono text-[9px] font-bold text-[#0A0A0A] bg-white border border-[#0A0A0A] px-1 shadow-[1px_1px_0px_#0A0A0A] select-none pointer-events-none">
          WED
        </div>
      </Html>
      <Html position={[-offsetX - 0.45, 0.1, offsetZ - 0.28]} center>
        <div className="font-mono text-[9px] font-bold text-[#0A0A0A] bg-white border border-[#0A0A0A] px-1 shadow-[1px_1px_0px_#0A0A0A] select-none pointer-events-none">
          FRI
        </div>
      </Html>

      {/* Clean 3D Month Anchored Labels (along front edge) */}
      {monthAnchors.slice(0, 12).map((m, idx) => (
        <Html key={`${m.name}-${idx}`} position={[m.x, 0.08, offsetZ + 0.38]} center>
          <div className="font-mono text-[8px] font-bold text-[#0A0A0A] bg-white border border-[#0A0A0A] px-1 shadow-[1px_1px_0px_#0A0A0A] select-none pointer-events-none whitespace-nowrap">
            {m.name}
          </div>
        </Html>
      ))}

      {/* 52-Week Cel-Shaded Towers Array */}
      {flatBars.map((bar) => {
        const isHovered = hoveredKey === bar.key;
        const towerColor = isHovered ? '#FF5A1F' : bar.color;

        return (
          <group key={bar.key} position={[bar.x, bar.height / 2, bar.z]}>
            <mesh
              onPointerOver={(e) => handlePointerOver(e, bar)}
              onPointerOut={handlePointerOut}
              scale={isHovered ? [1.15, 1.05, 1.15] : [1, 1, 1]}
            >
              <boxGeometry args={[0.20, bar.height, 0.22]} />
              <meshToonMaterial color={towerColor} />
              <Edges threshold={15} color="#0A0A0A" lineWidth={1.5} />
            </mesh>

            {/* Small Flag Marker on Today */}
            {bar.isToday && (
              <group position={[0, bar.height / 2 + 0.18, 0]}>
                {/* Flag pole */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.22, 6]} />
                  <meshBasicMaterial color="#0A0A0A" />
                </mesh>
                {/* Orange triangle flag */}
                <mesh position={[0.06, 0.06, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.06, 0.10, 3]} />
                  <meshBasicMaterial color="#FF5A1F" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default GitHubSkyline;
