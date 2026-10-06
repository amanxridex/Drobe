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
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Find slide with lookbook_banner_9 (on3mile Everyday Essentials Elevated)
  // Let's drag or click to get there
  for (let i = 0; i < 4; i++) {
    const banner9 = await page.$('div[style*="border-radius: 20"] img[src*="lookbook_banner_9"]');
    if (banner9) {
      console.log('Found banner 9!');
      break;
    }
    const rightCards = await page.$$('div[style*="cursor: pointer"]');
    if (rightCards.length > 0) {
      await rightCards[rightCards.length - 1].click();
      await new Promise(r => setTimeout(r, 700));
    }
  }

  await new Promise(r => setTimeout(r, 500));
  const heroSection = await page.$('section');
  if (heroSection) {
    await heroSection.screenshot({ path: 'C:/Users/User/Drobe/scripts/verified_essentials_elevated.png' });
    console.log('Saved verified_essentials_elevated.png');
  }

  await browser.close();
})();
