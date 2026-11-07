/**
 * MANUAL INSTAGRAM ENTRIES FALLBACK
 *
 * Use this file when INSTAGRAM_ACCESS_TOKEN is not configured or during offline development.
 * Do not scrape Instagram. Fill in your official posts or reels below:
 *
 * Schema:
 * - id: unique string identifier
 * - permalink: full URL to the Instagram Reel or Post (e.g., "https://www.instagram.com/reel/C-xyz123/")
 * - caption: post caption text
 * - publishedAt: ISO date string (e.g. "2025-06-15T12:00:00Z")
 * - thumbnailSrc: path to local image in /public/content/ig/ (e.g. "/content/ig/reel_01.webp")
 * - likes: optional count (omit if unknown, never fake)
 * - comments: optional count (omit if unknown, never fake)
 * - isPlaceholder: boolean flag if this is pending your entry
 */

export interface ManualInstagramItem {
  id: string;
  permalink: string;
  caption: string;
  publishedAt: string;
  thumbnailSrc: string;
  likes?: number;
  comments?: number;
  isPlaceholder?: boolean;
}

export const MANUAL_INSTAGRAM_ITEMS: ManualInstagramItem[] = [
  // Sunny: When you have specific reels you want featured without an API token, add them here.
  // Currently empty to trigger the friendly "REELS LOADING SOON" state as specified.
];

export const MANUAL_INSTAGRAM_STATS = {
  followers: undefined, // Filled via API or left undefined (never faked)
  reelCount: 0,
};

