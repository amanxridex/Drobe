const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Launching Chrome to crawl women categories...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const capturedUrls = new Set();
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('imagekit.io') || url.includes('.webp') || url.includes('.png')) {
      capturedUrls.add(url);
    }
  });

  console.log('Opening https://knotnow.co/ ...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 6000));

  // Click Women toggle: Click on the right side of the toggle (or tap coordinates around x=110, y=70)
  // Let's tap at x=105, y=70 (inside the gender pill area)
  console.log('Tapping toggle to switch to Women...');
  await page.mouse.click(105, 70);
  await new Promise(r => setTimeout(r, 6000));

  // Take screenshot of Women mode
  await page.screenshot({ path: path.resolve(__dirname, 'live_knot_women.png') });
  console.log('Saved scripts/live_knot_women.png');

  fs.writeFileSync(path.resolve(__dirname, 'women_image_urls.json'), JSON.stringify(Array.from(capturedUrls), null, 2));
  console.log(`Captured ${capturedUrls.size} URLs in women mode.`);

  await browser.close();
}

main().catch(console.error);
