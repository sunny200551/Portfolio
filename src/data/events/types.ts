export type EventType = 'hackathon' | 'contest' | 'workshop';

export interface EventLinks {
  project?: string;
  certificate?: string;
  github?: string;
}

export interface EventItem {
  slug: string;
  name: string;
  organizer: string;
  type: EventType;
  date: string; // ISO date format, e.g. '2024-09-15'
  location: string;
  role: string;
  summary: string;
  details: string[];
  whatIBuilt: string[];
  techStack: string[];
  outcome?: string;
  links: EventLinks;
  images: string[];
  draft: boolean;
}

