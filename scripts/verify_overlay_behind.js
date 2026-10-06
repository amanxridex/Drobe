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
  await new Promise(r => setTimeout(r, 1500));

  // Take screenshot of the Upper Hero section containing the Lookbook Carousel and Curve
  const heroSection = await page.$('section');
  if (heroSection) {
    await heroSection.screenshot({ path: 'C:/Users/User/Drobe/scripts/verified_hero_carousel.png' });
    console.log('Saved verified_hero_carousel.png');
  } else {
    console.log('Hero section not found');
  }

  // Also take a screenshot focused specifically on the bottom of the carousel cards
  const carouselArea = await page.$('div[style*="height: 462"]');
  if (carouselArea) {
    await carouselArea.screenshot({ path: 'C:/Users/User/Drobe/scripts/verified_carousel_only.png' });
    console.log('Saved verified_carousel_only.png');
  }

  await browser.close();
})();
