const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=390,844']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. Check Homepage for BottomNav
  console.log('Navigating to http://localhost:3006/ ...');
  await page.goto('http://localhost:3006/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'scripts/mobile_home_bottomnav.png' });
  console.log('Saved scripts/mobile_home_bottomnav.png');

  // 2. Check Product Page for TryAndBuySlider
  console.log('Navigating to http://localhost:3006/product/29393 ...');
  await page.goto('http://localhost:3006/product/29393', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'scripts/mobile_product_tryandbuyslider.png' });
  console.log('Saved scripts/mobile_product_tryandbuyslider.png');

  await browser.close();
})();
