import type { EventItem } from './types';

export * from './types';

// Load all event files matching *.event.ts eagerly
const modules = import.meta.glob<Record<string, { default: EventItem }>>('./*.event.ts', { eager: true });

export function getAllEvents(): EventItem[] {
  const isProd = import.meta.env.PROD;
  const events: EventItem[] = [];

  for (const path in modules) {
    const mod = modules[path] as unknown as { default?: EventItem };
    if (mod && mod.default) {
      events.push(mod.default);
    }
  }

  // Filter drafts in production builds
  const filtered = isProd ? events.filter((e) => !e.draft) : events;

  // Sort by date descending (newest first)
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEventBySlug(slug: string): EventItem | undefined {
  return getAllEvents().find((e) => e.slug === slug);
}
