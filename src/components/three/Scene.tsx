import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroPanes } from './HeroPanes';

// Checks if WebGL is available in the browser
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const Scene: React.FC = () => {
  const [hasWebGL] = useState(() => isWebGLAvailable());
  const [isHomeInView, setIsHomeInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Observe ONLY #home section
    const homeEl = document.getElementById('home');
    if (!homeEl) {
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHomeInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    observer.observe(homeEl);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.unobserve(homeEl);
      observer.disconnect();
    };
  }, []);

  if (!hasWebGL) {
    return null;
  }

  // Only render canvas while hero is in view
  if (!isHomeInView) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 7.5], fov: 34 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          frameloop={isHomeInView && isTabVisible ? 'always' : 'never'}
        >
          {/* Cel-shaded flat directional & ambient lighting */}
          <ambientLight intensity={0.9} color="#FFFFFF" />
          <directionalLight
            position={[6, 9, 7]}
            intensity={1.4}
            color="#FFFFFF"
          />
          <directionalLight
            position={[-5, -4, -3]}
            intensity={0.4}
            color="#EEF2FA"
          />

          {/* Hero Floating 3D Panes (Strictly active only in Hero) */}
          <HeroPanes />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;
