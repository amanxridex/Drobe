const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3005', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: 'scripts/our_app_men.png' });

  // Click gender toggle to switch to women
  await page.evaluate(() => {
    // Click the gender toggle container
    const headers = document.querySelectorAll('header');
    if (headers.length > 0) {
      const toggle = headers[0].querySelector('div[style*="cursor: pointer"]');
      // Click row 2 toggle
      const allPills = headers[0].querySelectorAll('div');
      for (const el of allPills) {
        if (el.textContent && (el.textContent.includes('Men') || el.textContent.includes('Women'))) {
          el.click();
          break;
        }
      }
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scripts/our_app_women.png' });

  console.log('Saved our_app_men.png and our_app_women.png');
  await browser.close();
}

main().catch(console.error);
