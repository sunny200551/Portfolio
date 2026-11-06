# Portfolio Design & Architecture Rules

Strict design, architecture, and visual system specifications. Followed across all phases of development.

---

### 1. Light Theme Only
* **Light mode exclusively**: Dark mode is completely removed.
* No theme toggles, no `.dark` classes, no dark CSS variables, no `prefers-color-scheme` branching.
* `color-scheme: light` set globally.
* Page background is pure white (`#FFFFFF`) with deep black (`#0A0A0A`) text.

---

### 2. Palette & Visual Rules
* **Strict 5-Color Flat Palette**:
  * White: `#FFFFFF` (page base, surfaces)
  * Black: `#0A0A0A` (primary text, 2px borders, hard shadows)
  * Navy: `#0A1A3F` (headings, solid cards, small blocks, hero accents)
  * Cobalt: `#0047AB` (accent blocks, highlights)
  * Orange: `#FF5A1F` (primary CTA fills, active pills, badges, accents)
  * Subtle Tint: `#EEF2FA` (subtle surfaces, empty states, secondary card fills)
* **Zero Gradients, Zero Glow, Zero Blur, Zero Glassmorphism**: All fills are 100% solid and flat.
* **Hard Block Shadows Only**: `6px 6px 0px #0A0A0A` (or `4px 4px 0px #0A0A0A` / `2px 2px 0px #0A0A0A`). Never blurred, no soft drop shadows.
* **Rhythm**: Full-bleed flat color blocks. Mostly crisp white sections, interspersed with cobalt or orange blocks. The entire page feels light, crisp, and editorial. No fully dark sections except possibly the footer.
* **Strict Contrast & WCAG AA**:
  * Black text on white (`#FFFFFF`) or orange (`#FF5A1F`).
  * White text on navy (`#0A1A3F`) or cobalt (`#0047AB`).
  * Never small orange text on white.

---

### 3. Typography
* **Display / Editorial**: Bricolage Grotesque (heavy weights: 700/800, tight tracking `-0.03em`), self-hosted via `@fontsource/bricolage-grotesque`.
* **Metadata / Specs / Code**: Geist Mono, self-hosted via `@fontsource/geist-mono`.
* Pairings must look designed, editorial, and poster-like.

---

### 4. 3D Rules (React Three Fiber + drei)
* **Cel / Toon Materials Only**: `MeshToonMaterial` with discrete 2-3 step `gradientMap`, or `MeshBasicMaterial` with black `Outlines`/`Edges`.
* **Hard Flat Shadows**: No environment reflections, no bloom, no post-processing glow, no smooth metallic shading.
* **Procedural Geometry Only**: No heavy GLB/gltf files.
* **Transparent Background**: Canvas has `gl={{ alpha: true }}` so the white page background shows through.
* Low FOV camera for an isometric/orthographic poster feel.
* Pause 3D execution when off-screen or tab hidden.

---

### 5. Motion System
* **GSAP ScrollTrigger + Lenis**: Custom cubic-bezier easing, 400–700ms durations.
* **Accessibility**: Strict respect for `prefers-reduced-motion`. When active, disable camera flights, 3D rotations, and pinned scroll scrub, replacing with simple static opacity fades.

---

### 6. Content Integrity
* Reuse real content only (from resume, GitHub API, coding stats). Never invent fake statistics, fake projects, fake testimonials, or fake events.
* Where content is pending user input, use typed `TODO` placeholders in `src/data/` and list every TODO item at the conclusion of each phase.

---

### 7. Section IDs & Navigation Hierarchy
The canonical section IDs must strictly match (9 sections):
1. `#home` (01 // Hero)
2. `#about` (02 // Bio & background)
3. `#work` (03 // Projects showcase)
4. `#skills` (04 // Technical skills)
5. `#github` (05 // Contributions & repositories)
6. `#stats` (06 // Problem solving on LeetCode & CodeChef)
7. `#events` (07 // Hackathons & workshops)
8. `#journey` (08 // Learning timeline from 2023 onwards)
9. `#contact` (09 // Direct contact & form)

---

### 8. Infrastructure & Security
* Preserve Firebase Firestore contact flow with validation, honeypot, and honest offline notification.
* Keep `Resume.pdf` in `public/`.
* Maintain GitHub Pages deployment (`vite.config.ts` base: `/` and `.github/workflows/deploy.yml`).
* Never commit secrets, `.env` files, or access tokens.

