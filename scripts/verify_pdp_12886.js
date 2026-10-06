const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 446, height: 950, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3005/product/12886', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Top screenshot
  await page.screenshot({ path: 'verified_pdp_top.png' });
  console.log('Captured verified_pdp_top.png');

  // Scroll to middle
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 550;
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'verified_pdp_middle.png' });
  console.log('Captured verified_pdp_middle.png');

  // Scroll to bottom
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 1200;
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'verified_pdp_bottom.png' });
  console.log('Captured verified_pdp_bottom.png');

  await browser.close();
})();
