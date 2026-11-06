import type { EventItem } from './types';

/**
 * Event Template Example
 * Copy this file, rename it to `<slug>.event.ts` (e.g. `sih-2024.event.ts`),
 * fill in your real details, and set `draft: false` when published.
 */
const event: EventItem = {
  slug: 'event-slug-name',
  name: 'Official Event Name',
  organizer: 'Organizing Institution or Community',
  type: 'hackathon', // 'hackathon' | 'contest' | 'workshop'
  date: '2024-10-15', // ISO format YYYY-MM-DD
  location: 'City / College / Online',
  role: 'Participant', // 'Participant', 'Finalist', 'Winner', 'Volunteer'
  summary: 'One or two sentence overview of the event, challenge, or topic covered.',
  details: [
    'First paragraph describing context, problem statement, or workshop modules.',
    'Second paragraph detailing execution, collaboration, or learning takeaways.'
  ],
  whatIBuilt: [
    'Key feature or component developed during the event.',
    'API integration or algorithm implemented.'
  ],
  techStack: ['React', 'TypeScript', 'Tailwind CSS'],
  outcome: 'Project prototype submitted and reviewed by the evaluation panel.',
  links: {
    project: '',
    certificate: '',
    github: ''
  },
  images: [], // Place images under public/events/<slug>/ and add relative paths here
  draft: true // Set to false when all information is verified and ready for production
};

export default event;

