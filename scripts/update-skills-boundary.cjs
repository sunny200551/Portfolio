const fs = require('fs');

let code = fs.readFileSync('src/sections/Skills.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { SkillsIsometricStack } from '../components/three/SkillsIsometricStack';",
  "import { SkillsIsometricStack } from '../components/three/SkillsIsometricStack';\r\nimport { CanvasErrorBoundary, TimeoutSuspense } from '../components/three/CanvasBoundary';"
);

// Add Flat2DSkillsGrid component definition
const flatGridCode = `
const Flat2DSkillsGrid: React.FC<{
  skills: typeof skillsData;
  activeGroup: typeof skillsData[0];
  onSelect: (group: typeof skillsData[0]) => void;
}> = ({ skills, activeGroup, onSelect }) => (
  <div className="w-full h-full p-4 bg-[#EEF2FA] flex flex-col justify-center items-center">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-md">
      {skills.map((g) => {
        const isSelected = g.category === activeGroup.category;
        return (
          <button
            key={g.category}
            onClick={() => onSelect(g)}
            style={{ backgroundColor: isSelected ? '#FF5A1F' : g.accent }}
            className={\`p-3 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] font-mono text-xs font-bold text-left transition-all \${
              isSelected ? 'text-black translate-x-0.5 translate-y-0.5 shadow-none' : 'text-white hover:-translate-y-0.5'
            }\`}
          >
            <div className="font-bold">{g.category.toUpperCase()}</div>
            <div className="text-[10px] opacity-80">{g.skills.length} items</div>
          </button>
        );
      })}
    </div>
    <span className="mt-3 font-mono text-[10px] font-bold text-[#0A0A0A]/60">2D FALLBACK STACK</span>
  </div>
);
`.replace(/\n/g, '\r\n');

code = code.replace('export const Skills: React.FC = () => {', flatGridCode + '\r\nexport const Skills: React.FC = () => {');

// Replace Suspense & Canvas with CanvasErrorBoundary & TimeoutSuspense
const oldCanvasBlock = `                <Suspense fallback={
                  <div className="flex items-center justify-center h-full font-mono text-xs text-[#0A0A0A] font-bold">
                    LOADING 3D VIEW...
                  </div>
                }>
                  <Canvas
                    dpr={[1, 1.5]}
                    camera={{ position: [4.6, 5.2, 5.4], fov: 38 }}
                    gl={{ alpha: true, antialias: true }}
                    frameloop={isInView && isTabVisible ? 'always' : 'never'}
                  >
                    <ambientLight intensity={1.1} />
                    <directionalLight position={[6, 9, 5]} intensity={1.5} />
                    <directionalLight position={[-5, -2, -4]} intensity={0.5} />
                    
                    <SkillsIsometricStack
                      onSelectGroup={(group) => setActiveGroup(group)}
                      selectedGroup={activeGroup}
                    />
                  </Canvas>
                </Suspense>`.replace(/\n/g, '\r\n');

const newCanvasBlock = `                <CanvasErrorBoundary fallback={<Flat2DSkillsGrid skills={skillsData} activeGroup={activeGroup} onSelect={setActiveGroup} />}>
                  <TimeoutSuspense
                    timeoutMs={4000}
                    fallback={
                      <div className="flex items-center justify-center h-full font-mono text-xs text-[#0A0A0A] font-bold">
                        <span className="w-3 h-3 border-2 border-[#FF5A1F] border-t-transparent animate-spin inline-block mr-2" />
                        LOADING 3D VIEW...
                      </div>
                    }
                    timeoutFallback={<Flat2DSkillsGrid skills={skillsData} activeGroup={activeGroup} onSelect={setActiveGroup} />}
                  >
                    <Canvas
                      dpr={[1, 1.5]}
                      camera={{ position: [4.6, 5.2, 5.4], fov: 38 }}
                      gl={{ alpha: true, antialias: true }}
                      frameloop={isInView && isTabVisible ? 'always' : 'never'}
                    >
                      <ambientLight intensity={1.1} />
                      <directionalLight position={[6, 9, 5]} intensity={1.5} />
                      <directionalLight position={[-5, -2, -4]} intensity={0.5} />
                      
                      <SkillsIsometricStack
                        onSelectGroup={(group) => setActiveGroup(group)}
                        selectedGroup={activeGroup}
                      />
                    </Canvas>
                  </TimeoutSuspense>
                </CanvasErrorBoundary>`.replace(/\n/g, '\r\n');

if (!code.includes(oldCanvasBlock)) {
  console.error('oldCanvasBlock not found in Skills.tsx!');
  process.exit(1);
}

code = code.replace(oldCanvasBlock, newCanvasBlock);
fs.writeFileSync('src/sections/Skills.tsx', code, 'utf8');
console.log('Successfully updated Skills.tsx with CanvasErrorBoundary and TimeoutSuspense');

