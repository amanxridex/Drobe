const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const pagesToCapture = [
    { url: 'http://localhost:3005/', file: 'verified_home.png' },
    { url: 'http://localhost:3005/product/36440', file: 'verified_pdp.png' },
    { url: 'http://localhost:3005/collection/ethnic', file: 'verified_collection.png' },
    { url: 'http://localhost:3005/cart', file: 'verified_cart.png' },
    { url: 'http://localhost:3005/profile', file: 'verified_profile.png' },
    { url: 'http://localhost:3005/search', file: 'verified_search.png' }
  ];

  for (const item of pagesToCapture) {
    console.log(`Capturing ${item.url} ...`);
    try {
      await page.goto(item.url, { waitUntil: 'load', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(__dirname, '..', 'public', item.file) });
      console.log(`Saved ${item.file}`);
    } catch (e) {
      console.error(`Error on ${item.url}:`, e.message);
    }
  }

  // Also capture Desktop frame
  console.log('Capturing Desktop Viewport...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3005/', { waitUntil: 'load', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(__dirname, '..', 'public', 'verified_desktop.png') });
  console.log('Saved verified_desktop.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
