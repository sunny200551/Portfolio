export type ContentPlatform = 'youtube' | 'instagram';
export type ContentKind = 'video' | 'short' | 'reel';

export interface ContentThumbnail {
  src: string;
  width: number;
  height: number;
  webpSrc?: string;
}

export interface ContentItem {
  id: string;
  platform: ContentPlatform;
  kind: ContentKind;
  title: string;
  caption?: string;
  url: string;
  thumbnail: ContentThumbnail;
  publishedAt: string; // ISO 8601 string
  durationSec?: number;
  views?: number;
  likes?: number;
  comments?: number;
}

export interface ChannelStats {
  subscribers?: number;
  videoCount?: number;
  totalViews?: number;
  followers?: number;
  reelCount?: number;
  fetchedAt: string;
}

export interface ContentPayload {
  stats: ChannelStats;
  items: ContentItem[];
  source: 'api' | 'rss' | 'snapshot' | 'manual';
  updatedAt: string;
}
