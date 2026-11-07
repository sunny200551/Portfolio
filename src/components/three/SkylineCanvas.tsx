import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { GitHubSkyline, type DayHoverInfo, type ContributionWeek } from './GitHubSkyline';

interface SkylineCanvasProps {
  calendarWeeks: ContributionWeek[];
  isSkylineInView: boolean;
  isTabVisible: boolean;
  onHoverDay: (info: DayHoverInfo | null) => void;
}

export const SkylineCanvas: React.FC<SkylineCanvasProps> = ({
  calendarWeeks,
  isSkylineInView,
  isTabVisible,
  onHoverDay,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isInteractive, setIsInteractive] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Track Ctrl / Cmd key for quick zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(true);
      if (e.key === 'Escape' && isInteractive) setIsInteractive(false);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isInteractive]);

  // Click outside to release interactive zoom mode
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsInteractive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetCamera = useCallback(() => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    camera.position.multiplyScalar(0.85);
    controlsRef.current.update();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    camera.position.multiplyScalar(1.18);
    controlsRef.current.update();
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={() => setIsInteractive(true)}
      onDoubleClick={handleResetCamera}
      data-lenis-prevent={isInteractive ? 'true' : undefined}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
    >
      {/* Neo-brutalist Interactive Badge & Quick Controls */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
        {isInteractive ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF5A1F] text-black font-mono text-[10px] font-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] animate-pulse">
            <span className="w-2 h-2 bg-black rounded-full" />
            <span>INTERACTIVE (ESC TO EXIT)</span>
          </span>
        ) : (
          <span className="hidden sm:inline-block px-2 py-0.5 bg-white border border-[#0A0A0A] text-[#0A0A0A] font-mono text-[10px] font-bold shadow-[1px_1px_0px_#0A0A0A]">
            CLICK TO ENABLE ZOOM
          </span>
        )}

        {/* Zoom In Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="w-7 h-7 flex items-center justify-center bg-white text-[#0A0A0A] font-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#EEF2FA] active:translate-x-0.5 active:translate-y-0.5 text-xs cursor-pointer"
          title="Zoom In (+)"
          aria-label="Zoom in"
        >
          +
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="w-7 h-7 flex items-center justify-center bg-white text-[#0A0A0A] font-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#EEF2FA] active:translate-x-0.5 active:translate-y-0.5 text-xs cursor-pointer"
          title="Zoom Out (-)"
          aria-label="Zoom out"
        >
          −
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleResetCamera();
          }}
          className="px-2 py-1 bg-white text-[#0A0A0A] font-mono font-bold text-[10px] uppercase border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#FF5A1F] hover:text-black active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          title="Reset View"
          aria-label="Reset Camera View"
        >
          RESET
        </button>
      </div>

      {/* Subtle Hint Overlay */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none font-mono text-[10px] font-bold text-[#0A0A0A]/70 uppercase tracking-wider bg-white/90 px-2 py-0.5 border border-[#0A0A0A]/40">
        DRAG TO ROTATE / CLICK TO ENABLE ZOOM
      </div>

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [-10, 11, 12], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        frameloop={isSkylineInView && isTabVisible ? 'always' : 'never'}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[6, 14, 8]} intensity={1.6} />
        <directionalLight position={[-8, -2, -6]} intensity={0.5} />

        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enableZoom={isInteractive || isCtrlPressed}
          enablePan={false}
          dampingFactor={0.08}
          minDistance={8}
          maxDistance={32}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minPolarAngle={0.15}
        />

        <GitHubSkyline
          weeks={calendarWeeks}
          onHoverDay={onHoverDay}
        />
      </Canvas>
    </div>
  );
};

export default SkylineCanvas;
