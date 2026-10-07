const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://knotnow.co', ['geolocation']);

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setGeolocation({ latitude: 19.0760, longitude: 72.8777 });

  const capturedUrls = new Set();
  const apiPayloads = [];

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('imagekit.io') || url.includes('.webp') || url.includes('.png') || url.includes('.jpg')) {
      capturedUrls.add(url);
    }
    if (url.includes('sapi.knotnow.co/page/')) {
      try {
        const text = await res.text();
        apiPayloads.push({ url, text });
      } catch (e) {}
    }
  });

  console.log('Opening knotnow.co...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // Dismiss promo modal
  await page.touchscreen.tap(195, 795);
  await new Promise(r => setTimeout(r, 1500));

  // Switch to Women mode
  console.log('Switching to Women mode...');
  await page.touchscreen.tap(115, 150);
  await new Promise(r => setTimeout(r, 3500));

  await page.screenshot({ path: 'scripts/knot_women_sec_0.png' });
  console.log('Saved section 0 screenshot');

  // Scroll 12 times to load all sections and products in Women feed
  for (let s = 1; s <= 12; s++) {
    console.log(`Scrolling women feed ${s}/12...`);
    await page.evaluate(() => window.scrollBy(0, 550));
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `scripts/knot_women_sec_${s}.png` });
  }

  fs.writeFileSync('scripts/knot_women_all_urls.json', JSON.stringify(Array.from(capturedUrls), null, 2));
  fs.writeFileSync('scripts/knot_women_api_pages.json', JSON.stringify(apiPayloads, null, 2));
  console.log(`Crawl done! ${capturedUrls.size} images, ${apiPayloads.length} API pages.`);

  await browser.close();
}

main().catch(console.error);
