import type { VercelRequest, VercelResponse } from '@vercel/node';
import snapshot from '../src/data/content.snapshot.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CDN cache headers: 1 hour edge cache with 24h stale-while-revalidate
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400, public');
  res.setHeader('Content-Type', 'application/json');

  try {
    // If running in production with live sync available, can return synced data or snapshot
    return res.status(200).json(snapshot);
  } catch (error) {
    return res.status(200).json(snapshot);
  }
}

