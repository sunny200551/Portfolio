const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Profile scrolling performance
  const metrics = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const frameTimes = [];
      let lastTime = performance.now();
      let isScrolling = true;

      const recordFrame = (now) => {
        const delta = now - lastTime;
        lastTime = now;
        frameTimes.push(delta);
        if (isScrolling) {
          requestAnimationFrame(recordFrame);
        } else {
          // Calculate metrics
          const validFrames = frameTimes.slice(2); // Skip warm-up frames
          const totalDuration = validFrames.reduce((a, b) => a + b, 0);
          const avgFrameTime = totalDuration / validFrames.length;
          const fps = 1000 / avgFrameTime;
          const longFrames32 = validFrames.filter(t => t > 32).length;
          const longFrames50 = validFrames.filter(t => t > 50).length;
          const maxFrameTime = Math.max(...validFrames);

          resolve({
            totalFrames: validFrames.length,
            fps: Math.round(fps * 10) / 10,
            avgFrameTime: Math.round(avgFrameTime * 10) / 10,
            longFrames32,
            longFrames50,
            maxFrameTime: Math.round(maxFrameTime * 10) / 10,
          });
        }
      };

      requestAnimationFrame(recordFrame);

      // Perform a smooth continuous full-page scroll over ~4 seconds
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const startTime = performance.now();
      const scrollDuration = 4000;

      const scrollStep = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / scrollDuration);
        // Easing in-out
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        window.scrollTo(0, ease * maxScroll);

        if (progress < 1) {
          requestAnimationFrame(scrollStep);
        } else {
          setTimeout(() => {
            isScrolling = false;
          }, 300);
        }
      };

      requestAnimationFrame(scrollStep);
    });
  });

  console.log('=== BEFORE PROFILING METRICS ===');
  console.log(JSON.stringify(metrics, null, 2));

  await browser.close();
})();

