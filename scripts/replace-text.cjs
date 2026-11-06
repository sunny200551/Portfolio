const fs = require('fs');

let code = fs.readFileSync('src/components/three/GitHubSkyline.tsx', 'utf8');

const target1 = `          return (
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
          );`.replace(/\n/g, '\r\n');

const repl1 = `          return (
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
          );`.replace(/\n/g, '\r\n');

const target2 = `        {monthLabels.map((m) => (
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
        ))}`.replace(/\n/g, '\r\n');

const repl2 = `        {monthLabels.map((m) => (
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

if (!code.includes(target1)) {
  console.error('Target 1 not found!');
  process.exit(1);
}
if (!code.includes(target2)) {
  console.error('Target 2 not found!');
  process.exit(1);
}

code = code.replace(target1, repl1);
code = code.replace(target2, repl2);

fs.writeFileSync('src/components/three/GitHubSkyline.tsx', code, 'utf8');
console.log('Successfully replaced Text with Html in GitHubSkyline.tsx');

