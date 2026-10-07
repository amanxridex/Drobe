const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function crawlWomenFeed() {
  console.log('Launching browser to capture full Women feed...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://knotnow.co', ['geolocation']);

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setGeolocation({ latitude: 19.0760, longitude: 72.8777 });

  const apiPayloads = [];
  const imageUrls = new Set();

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('sapi.knotnow.co') || url.includes('/api/')) {
      try {
        const text = await response.text();
        apiPayloads.push({ url, status: response.status(), text });
        console.log('Captured API response:', url, 'Length:', text.length);
      } catch (e) {}
    }

    if (url.includes('imagekit.io') || url.includes('droplet')) {
      imageUrls.add(url);
    }
  });

  console.log('Navigating to knotnow.co...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 5000));

  // Dismiss festive promo modal if open
  try {
    await page.mouse.click(195, 750);
    console.log('Clicked promo continue');
  } catch (e) {}
  await new Promise(r => setTimeout(r, 2000));

  // Switch to Women mode
  // In Knot's header, gender pill is around x: 100, y: 155
  console.log('Tapping Women toggle...');
  await page.touchscreen.tap(100, 155);
  await new Promise(r => setTimeout(r, 4000));

  // Take screenshot of top of women mode
  await page.screenshot({ path: 'scripts/real_knot_women_top.png' });
  console.log('Saved real_knot_women_top.png');

  // Scroll down step by step to load ALL women sections and images
  for (let i = 1; i <= 10; i++) {
    console.log(`Scrolling women feed step ${i}/10...`);
    await page.evaluate(() => window.scrollBy(0, 700));
    await new Promise(r => setTimeout(r, 2000));
  }

  // Final screenshot after scrolling
  await page.screenshot({ path: 'scripts/real_knot_women_scrolled.png' });
  console.log('Saved real_knot_women_scrolled.png');

  fs.writeFileSync('scripts/women_live_api.json', JSON.stringify(apiPayloads, null, 2));
  fs.writeFileSync('scripts/women_all_imagekit_urls.json', JSON.stringify(Array.from(imageUrls), null, 2));
  console.log(`Saved ${apiPayloads.length} API payloads and ${imageUrls.size} imagekit URLs!`);

  await browser.close();
}

crawlWomenFeed().catch(console.error);
