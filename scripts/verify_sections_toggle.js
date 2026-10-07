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

  console.log('Navigating to http://localhost:3005 ...');
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle2', timeout: 30000 });

  // Dismiss location modal if open
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scripts/verified_men_mode.png' });
  console.log('Saved verified_men_mode.png');

  // Click gender toggle in header
  // Find the toggle pill with text "Men"
  await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const toggle = divs.find(d => d.textContent && (d.textContent.includes('Men') || d.textContent.includes('Women')) && d.style && d.style.borderRadius && d.style.borderRadius.includes('9999'));
    if (toggle) {
      toggle.click();
    }
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/verified_women_mode.png' });
  console.log('Saved verified_women_mode.png');

  await browser.close();
}

main().catch(console.error);
