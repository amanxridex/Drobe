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
  console.log('Launching Chrome with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    args: [
      '--window-size=430,932',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const capturedUrls = new Set();
  const apiPayloads = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('imagekit.io') || url.includes('.png') || url.includes('.webp') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.svg') || url.includes('droplet')) {
      capturedUrls.add(url);
      console.log('Captured Image URL:', url);
    }

    if (url.includes('sapi.knotnow.co')) {
      try {
        const text = await response.text();
        apiPayloads.push({ url, text });
        console.log('Captured SAPI Response:', url, 'Length:', text.length);
      } catch (e) {}
    }
  });

  console.log('Navigating to https://knotnow.co/ ...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle0', timeout: 60000 });

  console.log('Waiting 15 seconds for Flutter Web to boot and fetch home feed...');
  await new Promise(r => setTimeout(r, 15000));

  // Scroll down to load more sections
  for (let i = 0; i < 5; i++) {
    console.log(`Scrolling step ${i + 1}...`);
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`Total captured image URLs: ${capturedUrls.size}`);
  const outDir = path.resolve(__dirname, '..', 'public', 'assets', 'captured');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'captured_image_urls.json'), JSON.stringify(Array.from(capturedUrls), null, 2));
  fs.writeFileSync(path.join(outDir, 'captured_api_payloads.json'), JSON.stringify(apiPayloads, null, 2));

  // Take screenshot
  await page.screenshot({ path: path.join(outDir, 'knot_live_screenshot.png') });
  console.log('Saved live screenshot!');

  // Now automatically download every single captured image directly into public/assets/captured/!
  console.log('Beginning download of all captured real assets...');
  let dlCount = 0;
  for (const imgUrl of capturedUrls) {
    try {
      const u = new URL(imgUrl);
      const pathname = u.pathname;
      const baseName = path.basename(pathname) || `asset_${dlCount}.webp`;
      const cleanName = baseName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      const destPath = path.join(outDir, `${dlCount}_${cleanName}`);
      await downloadFile(imgUrl, destPath);
      dlCount++;
      console.log(`[${dlCount}/${capturedUrls.size}] Downloaded: ${cleanName}`);
    } catch (err) {
      console.error('Failed to download:', imgUrl, err.message);
    }
  }

  console.log(`Successfully downloaded ${dlCount} real Knot images!`);
  await browser.close();
  console.log('Browser closed successfully.');
}

main().catch(err => {
  console.error('Error running crawler:', err);
  process.exit(1);
});
