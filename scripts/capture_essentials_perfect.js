const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 446, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3005?t=' + Date.now(), { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 800));

  const heroSection = await page.$('section');
  if (heroSection) {
    await heroSection.screenshot({ path: 'C:/Users/User/Drobe/scripts/verified_essentials_elevated_perfect.png' });
    console.log('Saved verified_essentials_elevated_perfect.png');
  }
  await browser.close();
})();
