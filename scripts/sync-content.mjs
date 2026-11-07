import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANNEL_ID = 'UCDWRiLe6mzIiaI14NjTbm_g';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

const OUT_DIR = path.join(__dirname, '../public/data');
const YT_THUMB_DIR = path.join(__dirname, '../public/content/yt');
const IG_THUMB_DIR = path.join(__dirname, '../public/content/ig');
const SNAPSHOT_PATH = path.join(__dirname, '../src/data/content.snapshot.json');

// Ensure output directories exist
for (const dir of [OUT_DIR, YT_THUMB_DIR, IG_THUMB_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Known manual overrides for YouTube item classification
const KIND_OVERRIDES = {
  '_JvF5R8tUKc': 'short',
  'NhmlhwOkA64': 'short',
};

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data });
        } else {
          const err = new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`);
          err.statusCode = res.statusCode;
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      return resolve(dest); // already cached
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return resolve(null); // non-fatal
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      resolve(null);
    });
  });
}

// 1. YouTube Fetcher: API v3 -> RSS Fallback -> Snapshot Fallback
async function fetchYouTubeContent() {
  // Option A: YouTube Data API v3 if key available
  if (YOUTUBE_API_KEY) {
    try {
      console.log('[sync-content] Trying YouTube Data API v3...');
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;
      const chanRes = await fetchUrl(channelUrl);
      const chanJson = JSON.parse(chanRes.data);

      if (chanJson.items && chanJson.items.length > 0) {
        const ch = chanJson.items[0];
        const uploadsPlaylistId = ch.contentDetails?.relatedPlaylists?.uploads || ('UU' + CHANNEL_ID.slice(2));
        const subCount = ch.statistics?.subscriberCount ? parseInt(ch.statistics.subscriberCount, 10) : undefined;
        const totalViews = ch.statistics?.viewCount ? parseInt(ch.statistics.viewCount, 10) : undefined;
        const videoCount = ch.statistics?.videoCount ? parseInt(ch.statistics.videoCount, 10) : undefined;

        // Fetch playlist items
        const plUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;
        const plRes = await fetchUrl(plUrl);
        const plJson = JSON.parse(plRes.data);

        const videoIds = (plJson.items || []).map((i) => i.snippet?.resourceId?.videoId).filter(Boolean);
        let videoDetails = {};

        if (videoIds.length > 0) {
          const vUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
          const vRes = await fetchUrl(vUrl);
          const vJson = JSON.parse(vRes.data);
          for (const v of vJson.items || []) {
            videoDetails[v.id] = v;
          }
        }

        const items = [];
        for (const it of plJson.items || []) {
          const vId = it.snippet.resourceId.videoId;
          const det = videoDetails[vId];
          const durationIso = det?.contentDetails?.duration || '';
          // Parse ISO 8601 duration
          let durationSec = 0;
          const m = durationIso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (m) {
            durationSec = (parseInt(m[1] || '0', 10) * 3600) + (parseInt(m[2] || '0', 10) * 60) + parseInt(m[3] || '0', 10);
          }

          let kind = KIND_OVERRIDES[vId];
          if (!kind) {
            if (durationSec > 0 && durationSec <= 60) kind = 'short';
            else if (it.snippet.title.toLowerCase().includes('#shorts') || it.snippet.title.toLowerCase().includes('#short')) kind = 'short';
            else kind = 'video';
          }

          const remoteThumb = it.snippet.thumbnails?.maxres?.url || it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.default?.url;
          const localThumbFile = `yt_${vId}.jpg`;
          const localThumbPath = path.join(YT_THUMB_DIR, localThumbFile);
          if (remoteThumb) {
            await downloadFile(remoteThumb, localThumbPath);
          }

          items.push({
            id: vId,
            platform: 'youtube',
            kind,
            title: it.snippet.title,
            caption: it.snippet.description,
            url: `https://www.youtube.com/watch?v=${vId}`,
            thumbnail: {
              src: `/content/yt/${localThumbFile}`,
              width: 1280,
              height: 720,
            },
            publishedAt: it.snippet.publishedAt,
            durationSec: durationSec || undefined,
            views: det?.statistics?.viewCount ? parseInt(det.statistics.viewCount, 10) : undefined,
            likes: det?.statistics?.likeCount ? parseInt(det.statistics.likeCount, 10) : undefined,
            comments: det?.statistics?.commentCount ? parseInt(det.statistics.commentCount, 10) : undefined,
          });
        }

        return {
          stats: { subscribers: subCount, videoCount: videoCount || items.length, totalViews, fetchedAt: new Date().toISOString() },
          items,
          source: 'api',
        };
      }
    } catch (err) {
      console.warn('[sync-content] YouTube API error, falling back to public RSS:', err.message);
    }
  }

  // Option B: Public RSS Feed Fallback
  try {
    console.log('[sync-content] Fetching public YouTube RSS feed...');
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const res = await fetchUrl(rssUrl);
    const xml = res.data;

    const entries = xml.split('<entry>');
    const items = [];

    for (let i = 1; i < entries.length; i++) {
      const e = entries[i];
      const titleM = e.match(/<title>([^<]+)<\/title>/);
      const idM = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const pubM = e.match(/<published>([^<]+)<\/published>/);
      const thumbM = e.match(/<media:thumbnail url="([^"]+)"/);
      const viewsM = e.match(/views="(\d+)"/);

      if (idM && titleM) {
        const vId = idM[1];
        const title = titleM[1];
        const publishedAt = pubM ? pubM[1] : new Date().toISOString();
        const views = viewsM ? parseInt(viewsM[1], 10) : undefined;

        let kind = KIND_OVERRIDES[vId];
        if (!kind) {
          if (title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('#short')) {
            kind = 'short';
          } else {
            kind = 'video';
          }
        }

        const remoteThumb = thumbM ? thumbM[1] : `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
        const localThumbFile = `yt_${vId}.jpg`;
        const localThumbPath = path.join(YT_THUMB_DIR, localThumbFile);
        await downloadFile(remoteThumb, localThumbPath);

        items.push({
          id: vId,
          platform: 'youtube',
          kind,
          title,
          url: `https://www.youtube.com/watch?v=${vId}`,
          thumbnail: {
            src: `/content/yt/${localThumbFile}`,
            width: 1280,
            height: 720,
          },
          publishedAt,
          views,
        });
      }
    }

    return {
      stats: {
        videoCount: items.length,
        fetchedAt: new Date().toISOString(),
      },
      items,
      source: 'rss',
    };
  } catch (err) {
    console.warn('[sync-content] YouTube RSS fetch failed:', err.message);
  }

  // Option C: Final Snapshot Fallback
  if (fs.existsSync(SNAPSHOT_PATH)) {
    console.log('[sync-content] Using local snapshot fallback for YouTube.');
    const snap = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    return {
      stats: snap.stats || { fetchedAt: new Date().toISOString() },
      items: (snap.items || []).filter((i) => i.platform === 'youtube'),
      source: 'snapshot',
    };
  }

  return { stats: { fetchedAt: new Date().toISOString() }, items: [], source: 'snapshot' };
}

// 2. Instagram Fetcher: Official API -> Manual File Fallback
async function fetchInstagramContent() {
  if (INSTAGRAM_ACCESS_TOKEN) {
    try {
      console.log('[sync-content] Trying Instagram Official API...');
      const meUrl = `https://graph.instagram.com/me?fields=username,followers_count,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
      const meRes = await fetchUrl(meUrl);
      const meJson = JSON.parse(meRes.data);

      const mediaUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
      const mediaRes = await fetchUrl(mediaUrl);
      const mediaJson = JSON.parse(mediaRes.data);

      const items = [];
      for (const m of mediaJson.data || []) {
        const isReel = m.media_product_type === 'REELS' || m.media_type === 'VIDEO';
        const remoteThumb = m.thumbnail_url || m.media_url;
        const localThumbFile = `ig_${m.id}.jpg`;
        const localThumbPath = path.join(IG_THUMB_DIR, localThumbFile);
        if (remoteThumb) {
          await downloadFile(remoteThumb, localThumbPath);
        }

        items.push({
          id: m.id,
          platform: 'instagram',
          kind: isReel ? 'reel' : 'video',
          title: (m.caption || '').slice(0, 60).replace(/\n/g, ' ') || 'Instagram Reel',
          caption: m.caption,
          url: m.permalink,
          thumbnail: {
            src: `/content/ig/${localThumbFile}`,
            width: 1080,
            height: 1920,
          },
          publishedAt: m.timestamp,
          likes: m.like_count,
          comments: m.comments_count,
        });
      }

      return {
        followers: meJson.followers_count,
        reelCount: meJson.media_count,
        items,
        source: 'api',
      };
    } catch (err) {
      console.warn('[sync-content] Instagram API error, using manual file:', err.message);
    }
  }

  // Fallback: Read manual file
  try {
    const manualModule = await import('../src/data/instagram.manual.ts').catch(() => null);
    const manualItems = manualModule?.MANUAL_INSTAGRAM_ITEMS || [];
    const manualStats = manualModule?.MANUAL_INSTAGRAM_STATS || {};

    const items = manualItems.map((m) => ({
      id: m.id,
      platform: 'instagram',
      kind: 'reel',
      title: (m.caption || '').slice(0, 60).replace(/\n/g, ' ') || 'Instagram Reel',
      caption: m.caption,
      url: m.permalink,
      thumbnail: {
        src: m.thumbnailSrc,
        width: 1080,
        height: 1920,
      },
      publishedAt: m.publishedAt,
      likes: m.likes,
      comments: m.comments,
    }));

    return {
      followers: manualStats.followers,
      reelCount: manualStats.reelCount || items.length,
      items,
      source: 'manual',
    };
  } catch (err) {
    console.warn('[sync-content] Failed to read manual Instagram data:', err.message);
    return { followers: undefined, reelCount: 0, items: [], source: 'manual' };
  }
}

// 3. Main Sync Routine
export async function syncContent() {
  console.log('[sync-content] Starting content synchronization...');
  const ytResult = await fetchYouTubeContent();
  const igResult = await fetchInstagramContent();

  const combinedStats = {
    subscribers: ytResult.stats?.subscribers,
    videoCount: ytResult.stats?.videoCount || ytResult.items.filter((i) => i.platform === 'youtube').length,
    totalViews: ytResult.stats?.totalViews,
    followers: igResult.followers,
    reelCount: igResult.reelCount || igResult.items.filter((i) => i.kind === 'reel').length,
    fetchedAt: new Date().toISOString(),
  };

  const allItems = [...ytResult.items, ...igResult.items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const payload = {
    stats: combinedStats,
    items: allItems,
    source: ytResult.source === 'api' && igResult.source === 'api' ? 'api' : ytResult.source,
    updatedAt: new Date().toISOString(),
  };

  // Write to public/data/content.json for client fetch
  const outPath = path.join(OUT_DIR, 'content.json');
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');

  // Also update committed snapshot src/data/content.snapshot.json
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`[sync-content] Synced ${allItems.length} content items (${ytResult.items.length} YT, ${igResult.items.length} IG). Saved to ${outPath} and ${SNAPSHOT_PATH}`);
  return payload;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncContent().catch((err) => {
    console.error('[sync-content] Fatal sync error:', err);
    process.exit(1);
  });
}
