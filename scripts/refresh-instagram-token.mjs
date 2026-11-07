/**
 * Instagram Long-Lived Access Token Refresh Script
 *
 * Official Meta Graph API docs:
 * Long-lived access tokens are valid for 60 days. You can refresh them using:
 * GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={token}
 *
 * Schedule: Run this once every 30 days via a cron job or GitHub Action.
 */

import https from 'https';

const token = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!token) {
  console.log('[refresh-token] No INSTAGRAM_ACCESS_TOKEN provided in environment.');
  process.exit(0);
}

const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;

https.get(refreshUrl, (res) => {
  let body = '';
  res.on('data', (d) => (body += d));
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.access_token) {
        console.log('[refresh-token] Successfully refreshed token! Expires in (seconds):', data.expires_in);
        console.log('[refresh-token] Update your INSTAGRAM_ACCESS_TOKEN repository secret or env file.');
      } else {
        console.error('[refresh-token] Failed to refresh token:', body);
      }
    } catch (e) {
      console.error('[refresh-token] JSON parse error:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('[refresh-token] Network error:', err.message);
});
