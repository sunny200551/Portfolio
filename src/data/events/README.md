# Events Data Directory

Each event participated is defined as an independent, typed TypeScript file.

### How to Add a New Event:
1. Copy `_template.event.example.ts`.
2. Rename the new file to `<slug>.event.ts` (e.g. `sih-2024.event.ts`).
3. Fill in the typed properties:
   - `name`, `organizer`, `type` (`hackathon` | `contest` | `workshop`)
   - `date` in ISO `YYYY-MM-DD` format
   - `location`, `role`, `summary`, `details`, `whatIBuilt`, `techStack`
   - `links` (`project`, `certificate`, `github`)
   - `images` (store image assets in `public/events/<slug>/`)
4. Set `draft: false` once the record and credentials are fully verified.
5. In production builds (`import.meta.env.PROD === true`), any file with `draft: true` is automatically excluded from the live directory. In development builds, drafts appear with a discrete `DRAFT` badge for previewing.

