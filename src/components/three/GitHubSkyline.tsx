import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, Text, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  1: '#7BA4E8', // Light cobalt tint
  2: '#0047AB', // Solid Cobalt
  3: '#0A1A3F', // Solid Navy
  4: '#FF5A1F', // Solid Orange (Peak)
};

const SPACING_X = 0.24;
const SPACING_Z = 0.28;
const MAX_ROTATION_DELTA = Math.PI / 6; // 30 degrees

/**
 * Declarative component to auto-fit orthographic camera zoom based on container width.
 */
function AutoFitCamera() {
  const size = useThree((state) => state.size);
  const zoom = Math.min(50, Math.max(16, size.width / 24));
  return <OrthographicCamera makeDefault position={[-5, 8, 10]} zoom={zoom} />;
}

export const GitHubSkyline: React.FC<GitHubSkylineProps> = ({ weeks, onHoverDay }) => {
  const groupRef = useRef<THREE.Group>(null);
  const barsRef = useRef<(THREE.Mesh | null)[]>([]);

  // Drag-rotation state
  const isDraggingRef = useRef(false);
  const startPointerXRef = useRef(0);
  const dragRotationDeltaRef = useRef(0);
  const targetRotationDeltaRef = useRef(0);

  // Use full 52 weeks or generate deterministic fallback
  const displayWeeks = useMemo(() => {
    if (weeks && weeks.length >= 52) {
      return weeks.slice(-52);
    }
    if (weeks && weeks.length > 0) {
      return weeks;
    }
    // 52-week fallback
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
  const { flatBars, monthLabels } = useMemo(() => {
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
    }[] = [];

    const months: { label: string; x: number }[] = [];
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

        // Check month label
        if (day.date) {
          const monthStr = new Date(day.date).toLocaleString('en-US', { month: 'short' });
          if (monthStr !== lastMonth) {
            months.push({ label: monthStr.toUpperCase(), x });
            lastMonth = monthStr;
          }
        }

        // Sunday at back (dIdx = 0), Saturday at front (dIdx = 6)
        const z = dIdx * SPACING_Z - offsetZ;
        const count = day.contributionCount || 0;
        const baseHeight = numericLevel === 0 ? 0.06 : 0.18 + numericLevel * 0.32;

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
        });
      });
    });

    return { flatBars: bars, monthLabels: months };
  }, [displayWeeks, offsetX, offsetZ]);

  // Pointer drag event handlers for interactive rotation
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    isDraggingRef.current = true;
    startPointerXRef.current = e.clientX;
  }, []);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startPointerXRef.current;
    // Map drag distance to rotation angle clamped to +/- 30 degrees
    const angle = (deltaX / 200) * MAX_ROTATION_DELTA;
    targetRotationDeltaRef.current = Math.max(-MAX_ROTATION_DELTA, Math.min(MAX_ROTATION_DELTA, angle));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    // Ease back to neutral rotation (0 delta)
    targetRotationDeltaRef.current = 0;
  }, []);

  // Staggered rising animation on scroll
  useEffect(() => {
    const section = document.getElementById('github');
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      barsRef.current.forEach((bar) => {
        if (bar) bar.scale.y = 1;
      });
      return;
    }

    const ctx = gsap.context(() => {
      barsRef.current.forEach((bar, idx) => {
        if (!bar) return;
        const barItem = flatBars[idx];
        const weekFraction = barItem ? barItem.weekIdx / numWeeks : 0;
        gsap.fromTo(
          bar.scale,
          { y: 0.01 },
          {
            y: 1,
            duration: 0.6,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
            },
            delay: weekFraction * 0.7,
          }
        );
      });
    });

    return () => ctx.revert();
  }, [flatBars, numWeeks]);

  // Frame loop: ease drag rotation delta back towards target
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    dragRotationDeltaRef.current = THREE.MathUtils.damp(
      dragRotationDeltaRef.current,
      targetRotationDeltaRef.current,
      6,
      delta
    );
    // Baseline isometric orientation around Y, offset by user drag
    groupRef.current.rotation.y = dragRotationDeltaRef.current;
  });

  const basePlateWidth = numWeeks * SPACING_X + 0.8;
  const basePlateDepth = 7 * SPACING_Z + 0.9;

  return (
    <>
      <AutoFitCamera />
      <group
        ref={groupRef}
        position={[0, -0.2, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Flat white base plate with black outline */}
        <mesh position={[0, -0.06, 0]} receiveShadow>
          <boxGeometry args={[basePlateWidth, 0.1, basePlateDepth]} />
          <meshToonMaterial color="#FFFFFF" />
          <Edges threshold={15} color="#0A0A0A" lineWidth={2} />
        </mesh>

        {/* Skyline Bars */}
        {flatBars.map((bar, idx) => (
          <mesh
            key={bar.key}
            ref={(el) => { barsRef.current[idx] = el; }}
            position={[bar.x, bar.height / 2, bar.z]}
            castShadow
            receiveShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverDay?.({
                date: bar.date,
                count: bar.count,
                clientX: e.clientX,
                clientY: e.clientY,
              });
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              onHoverDay?.(null);
            }}
          >
            <boxGeometry args={[0.2, bar.height, 0.22]} />
            <meshToonMaterial color={bar.color} />
            <Edges threshold={15} color="#0A0A0A" lineWidth={1} />
          </mesh>
        ))}

        {/* Weekday labels along the left edge (X side) */}
        {[
          { label: 'MON', dIdx: 1 },
          { label: 'WED', dIdx: 3 },
          { label: 'FRI', dIdx: 5 },
        ].map((item) => {
          const z = item.dIdx * SPACING_Z - offsetZ;
          return (
            <Text
              key={item.label}
              position={[-offsetX - 0.45, 0.06, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.2}
              color="#0A0A0A"
              anchorX="right"
              anchorY="middle"
              font="monospace"
              fontWeight="bold"
            >
              {item.label}
            </Text>
          );
        })}

        {/* Month labels along the front edge (Z side, Saturday edge) */}
        {monthLabels.map((m) => (
          <Text
            key={m.label + m.x}
            position={[m.x, 0.06, offsetZ + 0.35]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#0A0A0A"
            anchorX="center"
            anchorY="top"
            font="monospace"
            fontWeight="bold"
          >
            {m.label}
          </Text>
        ))}
      </group>
    </>
  );
};

export default GitHubSkyline;
