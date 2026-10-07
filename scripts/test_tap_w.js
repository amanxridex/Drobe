const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 3500));

  // Dismiss promo modal
  await page.touchscreen.tap(195, 795);
  await new Promise(r => setTimeout(r, 1500));

  // Tap W at (285, 150)
  console.log('Tapping W at (285, 150)...');
  await page.touchscreen.tap(285, 150);
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: 'scripts/verify_tap_285.png' });
  console.log('Saved verify_tap_285.png');

  await browser.close();
}

main().catch(console.error);
