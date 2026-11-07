const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function generateThumbnail() {
  const certPdfPath = path.resolve('public/certificates/datavalley-flutter-internship.pdf');
  if (!fs.existsSync(certPdfPath)) {
    console.error('PDF not found at', certPdfPath);
    process.exit(1);
  }

  const webpPath = path.resolve('public/certificates/datavalley-flutter-internship.webp');
  if (fs.existsSync(webpPath) && !process.env.FORCE_CERT_REGEN) {
    console.log('Certificate WebP thumbnail already exists. Skipping generation.');
    return;
  }

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--enable-features=PDFAnnotations', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>body { margin: 0; background: #fff; overflow: hidden; }</style>
      </head>
      <body>
        <canvas id="pdf-canvas"></canvas>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          async function render() {
            try {
              const loadingTask = pdfjsLib.getDocument('/certificates/datavalley-flutter-internship.pdf');
              const pdf = await loadingTask.promise;
              const page = await pdf.getPage(1);
              
              // Desired width: 640px
              const viewport = page.getViewport({ scale: 1 });
              const scale = 640 / viewport.width;
              const scaledViewport = page.getViewport({ scale: scale });
              
              const canvas = document.getElementById('pdf-canvas');
              canvas.width = scaledViewport.width;
              canvas.height = scaledViewport.height;
              const context = canvas.getContext('2d');
              
              await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
              window.__PDF_RENDERED = true;
            } catch (err) {
              window.__PDF_ERROR = err.message;
            }
          }
          render();
        </script>
      </body>
    </html>
  `;

  fs.writeFileSync('public/render-pdf-temp.html', html);
  
  try {
    await page.goto('http://localhost:5173/render-pdf-temp.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__PDF_RENDERED || window.__PDF_ERROR, { timeout: 20000 });

    const hasError = await page.evaluate(() => window.__PDF_ERROR);
    if (hasError) {
      throw new Error('PDF render error: ' + hasError);
    }

    const canvasEl = await page.$('#pdf-canvas');
    const pngBuffer = await canvasEl.screenshot({ type: 'png' });
    fs.writeFileSync('public/certificates/datavalley-flutter-internship.png', pngBuffer);

    const webpDataUrl = await page.evaluate(() => {
      const canvas = document.getElementById('pdf-canvas');
      return canvas.toDataURL('image/webp', 0.92);
    });
    const webpBase64 = webpDataUrl.replace(/^data:image\/webp;base64,/, '');
    fs.writeFileSync(webpPath, Buffer.from(webpBase64, 'base64'));

    console.log('Successfully generated 640px WebP thumbnail and PNG fallback!');
  } finally {
    if (fs.existsSync('public/render-pdf-temp.html')) {
      fs.unlinkSync('public/render-pdf-temp.html');
    }
    await browser.close();
  }
}

generateThumbnail().catch(err => {
  console.error('Thumbnail generation failed:', err);
  process.exit(1);
});
