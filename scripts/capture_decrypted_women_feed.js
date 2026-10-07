const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('Launching Chrome to intercept decrypted Women feed...');
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

  const intercepted = [];

  await page.exposeFunction('onInterceptedJson', (data) => {
    try {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      if (str.includes('product') || str.includes('brand') || str.includes('women') || str.includes('hp_women')) {
        console.log('INTERCEPTED REAL DATA! Length:', str.length);
        intercepted.push(data);
      }
    } catch (e) {}
  });

  await page.evaluateOnNewDocument(() => {
    const origParse = JSON.parse;
    JSON.parse = function (text, reviver) {
      const res = origParse.call(this, text, reviver);
      if (typeof text === 'string' && (text.includes('product') || text.includes('brand') || text.includes('items') || text.includes('hp_women') || text.includes('women'))) {
        try {
          window.onInterceptedJson(res);
        } catch (e) {}
      }
      return res;
    };
  });

  console.log('Navigating to knotnow.co...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 3500));

  // Dismiss promo modal
  console.log('Dismissing modal...');
  await page.touchscreen.tap(195, 795);
  await new Promise(r => setTimeout(r, 1500));

  // Tap Women toggle (115, 150)
  console.log('Tapping Women toggle...');
  await page.touchscreen.tap(115, 150);
  await new Promise(r => setTimeout(r, 4000));

  // Scroll down multiple times to trigger all data loads
  for (let i = 1; i <= 8; i++) {
    console.log(`Scrolling ${i}/8...`);
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`Total intercepted objects: ${intercepted.length}`);
  fs.writeFileSync('scripts/intercepted_women_full.json', JSON.stringify(intercepted, null, 2));
  console.log('Saved scripts/intercepted_women_full.json!');

  await page.screenshot({ path: 'scripts/knot_women_intercepted_screen.png' });
  await browser.close();
}

main().catch(console.error);
