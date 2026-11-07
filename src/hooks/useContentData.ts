import { useState, useEffect } from 'react';
import type { ContentPayload, ContentItem, ChannelStats } from '../types/content';
import snapshotData from '../data/content.snapshot.json';

const initialPayload: ContentPayload = snapshotData as unknown as ContentPayload;

export function useContentData() {
  const [data, setData] = useState<ContentPayload>(initialPayload);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFreshContent() {
      try {
        setIsLoading(true);
        // Try /api/content first (serverless), fallback to static /data/content.json
        const res = await fetch('/data/content.json', {
          headers: { 'Cache-Control': 'no-cache' },
        }).catch(() => null);

        if (res && res.ok) {
          const fresh = (await res.json()) as ContentPayload;
          if (isMounted && fresh && fresh.items) {
            setData(fresh);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch fresh content');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFreshContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    stats: data.stats as ChannelStats,
    items: (data.items || []) as ContentItem[],
    source: data.source,
    updatedAt: data.updatedAt,
    isLoading,
    error,
  };
}

export default useContentData;

