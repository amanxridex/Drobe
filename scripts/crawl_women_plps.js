const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Crawling live women category pages on Knot...');
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

  const productImages = new Set();
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('imagekit.io') && (url.includes('/brand/') || url.includes('/catalog_ingestion/'))) {
      productImages.add(url);
    }
  });

  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 3000));

  // Dismiss promo modal
  await page.touchscreen.tap(195, 795);
  await new Promise(r => setTimeout(r, 1500));

  // Switch to Women mode
  await page.touchscreen.tap(115, 150);
  await new Promise(r => setTimeout(r, 3000));

  // Click on "Ethnic Wear" (category 1) at x=50, y=340
  console.log('Tapping Ethnic Wear...');
  await page.touchscreen.tap(50, 340);
  await new Promise(r => setTimeout(r, 4000));

  // Scroll down in PLP
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(200, 600);
    await page.mouse.down();
    await page.mouse.move(200, 200, { steps: 10 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 1500));
  }

  await page.screenshot({ path: 'scripts/knot_ethnic_plp.png' });

  // Go back
  await page.goBack();
  await new Promise(r => setTimeout(r, 2000));

  // Click on "Dresses" (category 2) at x=125, y=340
  console.log('Tapping Dresses...');
  await page.touchscreen.tap(125, 340);
  await new Promise(r => setTimeout(r, 4000));

  // Scroll down in PLP
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(200, 600);
    await page.mouse.down();
    await page.mouse.move(200, 200, { steps: 10 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 1500));
  }

  await page.screenshot({ path: 'scripts/knot_dresses_plp.png' });

  console.log(`Captured ${productImages.size} real women product images!`);
  fs.writeFileSync('scripts/live_women_plp_images.json', JSON.stringify(Array.from(productImages), null, 2));

  await browser.close();
}

main().catch(console.error);
