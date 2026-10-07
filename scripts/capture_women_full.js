const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureWomenFeedFull() {
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

  const capturedImages = new Set();
  const apiData = [];

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('imagekit.io') || url.includes('.webp') || url.includes('.png') || url.includes('.jpg')) {
      capturedImages.add(url);
    }
    if (url.includes('sapi.knotnow.co')) {
      try {
        const text = await res.text();
        apiData.push({ url, text });
      } catch (e) {}
    }
  });

  console.log('Opening knotnow.co...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 5000));

  // Dismiss promo popup
  await page.mouse.click(195, 750);
  await new Promise(r => setTimeout(r, 1000));

  // Tap W on gender pill (x: 95, y: 115)
  console.log('Tapping W toggle at x=95, y=115...');
  await page.touchscreen.tap(95, 115);
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: 'scripts/real_knot_women_home_1.png' });
  console.log('Saved real_knot_women_home_1.png');

  // Scroll down multiple times to load all women sections
  for (let s = 1; s <= 8; s++) {
    console.log(`Scroll ${s}/8...`);
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: `scripts/real_knot_women_scroll_${s}.png` });
  }

  fs.writeFileSync('scripts/real_women_images.json', JSON.stringify(Array.from(capturedImages), null, 2));
  fs.writeFileSync('scripts/real_women_api.json', JSON.stringify(apiData, null, 2));
  console.log(`Done! Captured ${capturedImages.size} image URLs and ${apiData.length} API payloads.`);

  await browser.close();
}

captureWomenFeedFull().catch(console.error);
