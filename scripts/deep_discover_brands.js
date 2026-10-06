const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('Launching Chrome to inspect all brands from live app...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    args: ['--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const allBrandImages = new Set();
  const allBrandUrls = new Set();

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('brand') || url.includes('imagekit.io')) {
      allBrandUrls.add(url);
    }
  });

  await page.goto('https://knotnow.co/', { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 8000));

  // Let's scroll all the way down to the bottom of the home feed to see all brands & sections!
  for (let i = 0; i < 15; i++) {
    console.log(`Deep scrolling step ${i + 1}/15...`);
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(r => setTimeout(r, 2000));
  }

  // Click search icon if available
  console.log('Total URLs captured after deep scroll:', allBrandUrls.size);
  
  // Extract all brand names from URLs
  const brands = new Set();
  for (const u of allBrandUrls) {
    const match = u.match(/brand%2F([^%2F\/]+)/) || u.match(/\/brand\/([^/]+)/);
    if (match) {
      brands.add(decodeURIComponent(match[1]));
    }
  }

  console.log('Found brands from network:', Array.from(brands));
  fs.writeFileSync('C:\\Users\\User\\Drobe\\scripts\\all_discovered_brands.json', JSON.stringify({
    brands: Array.from(brands),
    urls: Array.from(allBrandUrls)
  }, null, 2));

  await browser.close();
  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
