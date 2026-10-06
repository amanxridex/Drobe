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
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    const trending = headings.find(h => h.textContent && h.textContent.includes('Trending In 60 Mins'));
    if (trending) {
      trending.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'verified_trending_showcase.png' });
  console.log('Successfully captured verified_trending_showcase.png');
  await browser.close();
})();
