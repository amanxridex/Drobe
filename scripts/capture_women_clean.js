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
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => stream.close(resolve));
    }).on('error', reject);
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const womenUrls = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (u.includes('imagekit.io') && (u.includes('Women') || u.includes('women') || u.includes('Dresses') || u.includes('dresses') || u.includes('Ethnic') || u.includes('Bottom') || u.includes('Top') || u.includes('Foot'))) {
      womenUrls.push(u);
      console.log('Detected category image URL:', u);
    }
  });

  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 6000));

  // Dismiss any modal by tapping top
  await page.touchscreen.tap(200, 80);
  await new Promise(r => setTimeout(r, 1000));

  // Tap "W" on gender toggle
  console.log('Tapping W on toggle...');
  await page.touchscreen.tap(125, 80);
  await new Promise(r => setTimeout(r, 4000));

  // If festive modal popped up, tap CONTINUE button at (200, 770) or tap outside
  await page.touchscreen.tap(200, 770);
  await new Promise(r => setTimeout(r, 4000));

  // Screenshot the clean women page!
  await page.screenshot({ path: path.resolve(__dirname, 'clean_women_screenshot.png') });
  console.log('Saved clean_women_screenshot.png');

  fs.writeFileSync('scripts/women_cat_urls.json', JSON.stringify(womenUrls, null, 2));

  // Also download the detected category images directly
  for (let i = 0; i < womenUrls.length; i++) {
    const dest = path.resolve(__dirname, `women_cat_${i}.webp`);
    try {
      await download(womenUrls[i], dest);
      console.log('Downloaded:', dest);
    } catch(e) {}
  }

  await browser.close();
})();
