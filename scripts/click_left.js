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
  await page.goto('http://localhost:3005?t=' + Date.now(), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Click on the left peek card to bring on3mile (Essentials Elevated) to center
  await page.mouse.click(50, 400);
  await new Promise(r => setTimeout(r, 1000));

  const heroSection = await page.$('section');
  if (heroSection) {
    await heroSection.screenshot({ path: 'C:/Users/User/Drobe/scripts/verified_on3mile_center.png' });
    console.log('Saved verified_on3mile_center.png');
  }
  await browser.close();
})();
