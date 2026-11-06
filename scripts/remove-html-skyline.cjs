const fs = require('fs');

let code = fs.readFileSync('src/components/three/GitHubSkyline.tsx', 'utf8');

// Remove Html import
code = code.replace("import { Edges, Html, OrthographicCamera } from '@react-three/drei';", "import { Edges, OrthographicCamera } from '@react-three/drei';");

// Remove 3D Html blocks
const labelsBlock = `        {/* Weekday labels along the left edge (X side) */}
        {[
          { label: 'MON', dIdx: 1 },
          { label: 'WED', dIdx: 3 },
          { label: 'FRI', dIdx: 5 },
        ].map((item) => {
          const z = item.dIdx * SPACING_Z - offsetZ;
          return (
            <group key={item.label} position={[-offsetX - 0.45, 0.08, z]}>
              <Html
                transform
                rotation={[-Math.PI / 2, 0, 0]}
                center
                distanceFactor={10}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                <span className="font-mono text-[10px] font-bold text-[#0A0A0A] tracking-wider select-none">
                  {item.label}
                </span>
              </Html>
            </group>
          );
        })}

        {/* Month labels along the front edge (Z side, Saturday edge) */}
        {monthLabels.map((m) => (
          <group key={m.label + m.x} position={[m.x, 0.08, offsetZ + 0.35]}>
            <Html
              transform
              rotation={[-Math.PI / 2, 0, 0]}
              center
              distanceFactor={10}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <span className="font-mono text-[10px] font-bold text-[#0A0A0A] tracking-wider select-none">
                {m.label}
              </span>
            </Html>
          </group>
        ))}`.replace(/\n/g, '\r\n');

code = code.replace(labelsBlock, '');

fs.writeFileSync('src/components/three/GitHubSkyline.tsx', code, 'utf8');
console.log('Removed Html from GitHubSkyline.tsx');

