const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('Launching installed Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Navigating to http://localhost:3005/ ...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 30000 });

  await page.evaluate(() => {
    localStorage.setItem('drobe_gender', 'men');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to section-1435 (Home & Lifestyle)
  console.log('Scrolling to section-1435...');
  const found = await page.evaluate(() => {
    const el = document.getElementById('section-1435');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      return true;
    }
    return false;
  });

  console.log('Section 1435 found in DOM:', found);
  await new Promise(r => setTimeout(r, 1500));

  const screenshotPath1 = path.resolve(__dirname, 'verified_home_and_lifestyle_1435.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log('Saved screenshot to:', screenshotPath1);

  // Now scroll the horizontal rail of section-1435 to verify horizontal scroll
  await page.evaluate(() => {
    const el = document.getElementById('section-1435');
    if (el) {
      const rail = el.querySelector('div[style*="overflow-x"]');
      if (rail) {
        rail.scrollLeft = 240;
      }
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const screenshotPath2 = path.resolve(__dirname, 'verified_home_and_lifestyle_scrolled.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log('Saved scrolled screenshot to:', screenshotPath2);

  // Also scroll up to Classic Black (section-1429)
  await page.evaluate(() => {
    const el = document.getElementById('section-1429');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const screenshotPath3 = path.resolve(__dirname, 'verified_classic_black_1429.png');
  await page.screenshot({ path: screenshotPath3 });
  console.log('Saved section-1429 screenshot to:', screenshotPath3);

  await browser.close();
  console.log('Verification complete!');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
