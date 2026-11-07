const fs = require('fs');

let code = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');

// Add getLenis import
if (!code.includes("import { getLenis } from '../lib/lenis';")) {
  code = code.replace(
    "import { robotStore } from '../robot/robotStore';",
    "import { robotStore } from '../robot/robotStore';\nimport { getLenis } from '../lib/lenis';"
  );
}

// Add scroll lock effect with strict cleanup
const triggerSearch = '// Global Ctrl+K trigger and Escape';
if (!code.includes('getLenis()?.stop()')) {
  const scrollLockEffect = `  // Strict Lenis pause and scroll lock management with guaranteed cleanup
  useEffect(() => {
    if (isOpen) {
      getLenis()?.stop();
      document.documentElement.classList.add('lenis-stopped');
      document.body.style.overflow = 'hidden';
    } else {
      getLenis()?.start();
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    }
    return () => {
      getLenis()?.start();
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    };
  }, [isOpen]);\n\n  ` + triggerSearch;

  code = code.replace(triggerSearch, scrollLockEffect);
}

// Add overscroll-behavior and data-lenis-prevent to list
code = code.replace(
  '<div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#0A0A0A]/10">',
  '<div data-lenis-prevent="true" style={{ overscrollBehavior: \'contain\' }} className="max-h-80 overflow-y-auto p-2 divide-y divide-[#0A0A0A]/10">'
);

// Add Shy mode commands
const robotOnCommand = `    {
      id: 'robot-on',
      name: 'Robot On (Enable 3D Mascots)',
      category: 'Actions',
      icon: Check,
      action: () => {
        robotStore.setRobotEnabled(true);
        onClose();
      }
    }`;

if (!code.includes('shy-mode-now')) {
  const shyCommands = robotOnCommand + `,
    {
      id: 'shy-mode-now',
      name: 'Shy Mode: Play Comedy Routine Now',
      category: 'Actions',
      icon: Sparkles,
      action: () => {
        window.dispatchEvent(new CustomEvent('robot:shy-mode-now'));
        onClose();
      }
    },
    {
      id: 'shy-mode-on',
      name: 'Shy Mode: Enable Idle Admirer Mode',
      category: 'Actions',
      icon: Check,
      action: () => {
        window.dispatchEvent(new CustomEvent('robot:shy-mode-toggle', { detail: true }));
        onClose();
      }
    },
    {
      id: 'shy-mode-off',
      name: 'Shy Mode: Disable Idle Admirer Mode',
      category: 'Actions',
      icon: Power,
      action: () => {
        window.dispatchEvent(new CustomEvent('robot:shy-mode-toggle', { detail: false }));
        onClose();
      }
    }`;

  code = code.replace(robotOnCommand, shyCommands);
}

fs.writeFileSync('src/components/CommandPalette.tsx', code, 'utf8');
console.log('Successfully updated CommandPalette.tsx!');

