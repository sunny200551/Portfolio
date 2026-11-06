const fs = require('fs');

let code = fs.readFileSync('src/sections/Events.tsx', 'utf8');

// 1. Add createPortal import
code = code.replace(
  "import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';",
  "import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';\r\nimport { createPortal } from 'react-dom';"
);

// 2. Add classList.add('modal-open') / remove in useEffect
code = code.replace(
  "document.documentElement.classList.add('lenis-stopped');",
  "document.documentElement.classList.add('lenis-stopped');\r\n      document.documentElement.classList.add('modal-open');"
);

code = code.replace(
  "document.documentElement.classList.remove('lenis-stopped');",
  "document.documentElement.classList.remove('lenis-stopped');\r\n        document.documentElement.classList.remove('modal-open');"
);

// 3. Wrap modal in createPortal(..., document.body)
const oldModalStart = `      {/* Full-Screen Detail Modal Panel (z-[100] strictly above all fixed UI) */}
      {selectedEvent && (
        <div 
          role="dialog"`.replace(/\n/g, '\r\n');

const newModalStart = `      {/* Full-Screen Detail Modal Panel (z-[100] strictly above all fixed UI) */}
      {selectedEvent && typeof document !== 'undefined' && createPortal(
        <div 
          role="dialog"`.replace(/\n/g, '\r\n');

if (!code.includes(oldModalStart)) {
  console.error('oldModalStart not found!');
  process.exit(1);
}

code = code.replace(oldModalStart, newModalStart);

// Close createPortal
const oldModalEnd = `          </div>
        </div>
      )}
    </section>`.replace(/\n/g, '\r\n');

const newModalEnd = `          </div>
        </div>,
        document.body
      )}
    </section>`.replace(/\n/g, '\r\n');

if (!code.includes(oldModalEnd)) {
  console.error('oldModalEnd not found!');
  process.exit(1);
}

code = code.replace(oldModalEnd, newModalEnd);

fs.writeFileSync('src/sections/Events.tsx', code, 'utf8');
console.log('Successfully wrapped Events modal in createPortal and added modal-open');

