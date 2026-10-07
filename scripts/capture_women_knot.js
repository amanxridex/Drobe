const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const capturedUrls = [];
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('imagekit.io')) {
      capturedUrls.push(url);
    }
  });

  console.log('Opening knotnow.co...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 60000 });
  console.log('Waiting past splash screen...');
  await new Promise(r => setTimeout(r, 7000));

  // Dismiss location dialog if present
  await page.mouse.click(200, 100);
  await new Promise(r => setTimeout(r, 1500));

  // Click Women toggle: around (x: 125, y: 80)
  console.log('Clicking Women toggle...');
  await page.mouse.click(125, 80);
  await new Promise(r => setTimeout(r, 5000));

  // Screenshot Women mode
  await page.screenshot({ path: 'scripts/knot_women_home_live.png' });
  console.log('Screenshot knot_women_home_live.png saved!');

  fs.writeFileSync('scripts/captured_women_all_urls.json', JSON.stringify(capturedUrls, null, 2));
  console.log('Saved', capturedUrls.length, 'URLs');

  await browser.close();
}

main().catch(err => console.error('Error:', err));
