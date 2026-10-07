const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
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
  await new Promise(r => setTimeout(r, 4000));
  await page.touchscreen.tap(195, 795); // dismiss promo
  await new Promise(r => setTimeout(r, 1000));

  // Tap W
  await page.touchscreen.tap(115, 150);
  await new Promise(r => setTimeout(r, 3000));

  // Swipe up
  for (let i = 1; i <= 6; i++) {
    console.log(`Swiping up ${i}/6...`);
    await page.mouse.move(195, 700);
    await page.mouse.down();
    await page.mouse.move(195, 200, { steps: 25 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `scripts/women_swipe_${i}.png` });
    console.log(`Saved women_swipe_${i}.png`);
  }

  await browser.close();
})().catch(console.error);
