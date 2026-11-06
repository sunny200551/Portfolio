const fs = require('fs');
const file = 'src/sections/Hero.tsx';
let hero = fs.readFileSync(file, 'utf8');

// Replace photo container
const oldPhotoPattern = /\{\/\* Grayscale multiply photo over cobalt block with offset orange block \*\/\}[\s\S]+?<\/div>\s+<\/div>/;
const newPhoto = `{/* Square Profile Photo with 3px Black Border and Offset Orange Block */}
            <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32">
              <div 
                className="absolute inset-0 bg-[#FF5A1F] translate-x-2.5 translate-y-2.5 border-[3px] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]" 
                aria-hidden="true" 
              />
              <div className="relative w-full h-full bg-[#0047AB] border-[3px] border-[#0A0A0A] overflow-hidden flex items-center justify-center">
                <img
                  src="/profile.webp"
                  alt="Sunny Pasumarthi - Computer Science Student & Frontend Developer"
                  width={128}
                  height={128}
                  loading="eager"
                  fetchpriority="high"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.includes('sunny200551.png')) {
                      img.src = 'https://github.com/sunny200551.png';
                    } else if (!img.src.endsWith('/avatar.png')) {
                      img.src = '/avatar.png';
                    }
                  }}
                />
              </div>
            </div>`;

hero = hero.replace(oldPhotoPattern, newPhoto);

// Add data-adaptive attributes to Hero texts
hero = hero.replace(
  'className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-[#0A0A0A]',
  'data-adaptive="hero:chip" className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-[#0A0A0A]'
);
hero = hero.replace(
  'className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter text-[#0A0A0A] leading-[0.92]"',
  'data-adaptive="hero:name" className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter text-[#0A0A0A] leading-[0.92]"'
);
hero = hero.replace(
  'className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] mt-1"',
  'data-adaptive="hero:tagline" className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] mt-1"'
);

fs.writeFileSync(file, hero);
console.log('Hero.tsx updated with profile photo and data-adaptive attributes');

