const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });

  // Click on the right peek card
  const cards = await page.$$('img[src*="lookbook_banner"]');
  console.log('Found cards:', cards.length);
  if (cards.length >= 3) {
    await cards[2].click();
    await new Promise(r => setTimeout(r, 600));
  }

  await page.screenshot({ path: path.resolve(__dirname, '..', 'verified_on3mile_active.png') });
  console.log('Saved verified_on3mile_active.png');
  await browser.close();
})();
