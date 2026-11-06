# 📐 Sunny Pasumarthi — Portfolio

> **Computer Science Student | Frontend Developer | Blockchain Enthusiast**  
> B.Tech Computer Science & Engineering (2023–2027) at NBKRIST  
> Live Website: [sunnypasumarthi.in](https://sunnypasumarthi.in) | GitHub: [@sunny200551](https://github.com/sunny200551)

An editorial, interactive 3D developer portfolio built with **React 19**, **Three.js**, **React Three Fiber**, **Tailwind CSS v4**, and **GSAP ScrollTrigger**. Designed under strict physical editorial constraints: solid flat color blocks, zero gradients or soft shadows, 2px borders, hard offset shadows, and self-hosted typographic pairings.

---

## 🎨 Visual System & Design Philosophy

Detailed rules are documented in [`DESIGN_RULES.md`](./DESIGN_RULES.md):

* **Light Theme Exclusively**: Pure white base (`#FFFFFF`) with deep black text (`#0A0A0A`) and high-contrast color blocks. Zero dark mode toggles or synthetic glow.
* **Strict 5-Color Flat Palette**:
  * White (`#FFFFFF`) — Canvas background & card panels
  * Black (`#0A0A0A`) — Body text, 2px solid structural borders, hard shadows
  * Navy (`#0A1A3F`) — Section headers, dark solid blocks, footer
  * Cobalt (`#0047AB`) — Accent blocks, primary link highlights, marquee
  * Orange (`#FF5A1F`) — Primary action fills, active badge chips, status dots
  * Subtle Tint (`#EEF2FA`) — Auxiliary surfaces & card fills
* **Hard Block Shadows**: `6px 6px 0px #0A0A0A` / `4px 4px 0px #0A0A0A`. Zero gaussian blur or soft ambient shadows.
* **Typography**:
  * Display: **Bricolage Grotesque** (weights 700/800, tight tracking `-0.03em`)
  * Metadata / Specs / Code: **Geist Mono**
  * Self-hosted via `@fontsource` with `font-display: swap`.
* **Cel-Shaded 3D (R3F + Drei)**:
  * Flat `MeshToonMaterial` and `MeshBasicMaterial` with solid black outlines (`Edges`).
  * Procedural geometry with transparent background; frame loops pause automatically when canvases are off-screen or the tab is hidden.

---

## 🏛️ Section Architecture (9 Canonical Sections)

1. **Hero (`#home` - 01)**: Typographic headline, typing effect with solid caret, honest status chip, and cel-shaded floating UI panes reacting to pointer parallax.
2. **Skills Marquee**: Two-row continuous ticker on a cobalt banner with tools Sunny actually uses.
3. **About (`#about` - 02)**: Modest student background at NBKRIST, core focus areas, and count-up metrics.
4. **Work (`#work` - 03)**: Pinned horizontal project gallery on desktop (vertical stack on mobile) with 3D card planes and case study modal dialogs.
5. **Skills (`#skills` - 04)**: 3D isometric slab stack with interactive hover inspector and flat accessible index fallback.
6. **GitHub (`#github` - 05)**: 3D isometric skyline rendering GitHub contributions across discrete color tiers.
7. **Stats (`#stats` - 06)**: Problem-solving metrics from LeetCode and CodeChef, flat progress bars, and milestone badges.
8. **Events (`#events` - 07)**: Cel-shaded 3D ticket stack, filterable event directory, and verification badges.
9. **Journey (`#journey` - 08)**: Vertical timeline with a black line that draws itself on scroll and flat orange square milestone nodes.
10. **Contact (`#contact` - 09)**: Full-bleed cobalt block, clean message form, flat palette confetti burst, and Firebase Firestore write.
11. **Minimal Navy Footer**: Section links, resume access, verified social links, and smooth back-to-top button.
12. **Navigation Rail & Command Palette (`Ctrl+K` / `⌘K`)**: Fixed SP logo, vertical 9-node section rail with scroll fill, fullscreen menu, and keyboard command palette.

---

## 🛠️ Technology Stack

* **Core**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Vite 8](https://vite.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom `@theme` CSS tokens
* **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei)
* **Animation & Scrolling**: [GSAP 3](https://gsap.com/) (`ScrollTrigger`), [Lenis](https://lenis.darkroom.engineering/) smooth scroll
* **Typography**: `@fontsource/bricolage-grotesque`, `@fontsource/geist-mono`
* **Icons**: [Lucide React](https://lucide.dev/)
* **Database & Submissions**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (with offline draft fallback)

---

## ⚙️ Automation Scripts & Workflows

### 1. GitHub Contributions & Active Repos Sync
* **Script**: `node scripts/fetch-github.mjs`
* **Workflow**: `.github/workflows/github-stats.yml` (runs daily at midnight UTC + `workflow_dispatch`)
* Uses GitHub's GraphQL API to fetch the last 12 months of contributions, current streak, stars, and active repositories directly into `public/data/github.json`.

### 2. LeetCode & CodeChef Benchmark Sync
* **Script**: `node scripts/fetch-stats.cjs`
* Fetches live problem counts and ratings into `src/data/codingStats.json`.

### 3. Production Deployment & Custom Domain
* **Workflow**: `.github/workflows/deploy.yml`
* Configured for GitHub Pages deployment with custom domain `sunnypasumarthi.in` and `CNAME` handling.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+)
* npm (v10+)

### Installation
```bash
git clone https://github.com/sunny200551/Portfolio.git
cd Portfolio
npm install
```

### Development
```bash
npm run dev
```

### Static Build & Lint
```bash
npm run lint
npm run build
```

---

## 📝 License
MIT © Sunny Pasumarthi.
