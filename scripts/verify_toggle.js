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

  // 1. Screenshot Men state
  await page.screenshot({ path: path.resolve(__dirname, '..', 'test_toggle_men.png') });
  console.log('Saved test_toggle_men.png');

  // 2. Click the gender toggle pill
  const toggle = await page.$('img[alt="Men"]');
  if (toggle) {
    await toggle.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.resolve(__dirname, '..', 'test_toggle_women.png') });
    console.log('Saved test_toggle_women.png');
  }

  await browser.close();
})();
