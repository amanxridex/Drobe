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

  console.log('Navigating to knotnow.co...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 3500));

  // Dismiss promo modal
  await page.touchscreen.tap(195, 795);
  await new Promise(r => setTimeout(r, 1500));

  // Tap Women toggle (115, 150)
  await page.touchscreen.tap(115, 150);
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: 'scripts/real_knot_women_scroll_0.png' });
  console.log('Saved real_knot_women_scroll_0.png');

  // Drag up 4 times to reveal sections
  for (let step = 1; step <= 4; step++) {
    console.log(`Dragging up step ${step}...`);
    await page.mouse.move(200, 700);
    await page.mouse.down();
    await page.mouse.move(200, 150, { steps: 15 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `scripts/real_knot_women_scroll_${step}.png` });
  }

  await browser.close();
}

main().catch(console.error);
