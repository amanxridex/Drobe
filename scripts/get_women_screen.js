const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const capturedUrls = new Map();
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('imagekit.io') || url.includes('.webp') || url.includes('.png')) {
      capturedUrls.set(url, response);
    }
  });

  console.log('Navigating to https://knotnow.co/ ...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 6000));

  // If location modal appeared, tap the backdrop at (200, 100) or close button
  await page.mouse.click(200, 100);
  await new Promise(r => setTimeout(r, 1500));

  // Tap "W" on the gender toggle: (x=125, y=80)
  console.log('Tapping W on gender toggle (125, 80)...');
  await page.mouse.click(125, 80);
  await new Promise(r => setTimeout(r, 5000));

  await page.screenshot({ path: path.resolve(__dirname, 'live_knot_women_home.png') });
  console.log('Saved live_knot_women_home.png!');

  // Save all URLs containing Women or cats
  const urls = Array.from(capturedUrls.keys());
  fs.writeFileSync(path.resolve(__dirname, 'all_knot_urls.json'), JSON.stringify(urls, null, 2));

  await browser.close();
}

main().catch(console.error);
