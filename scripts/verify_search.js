const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 1. Initial Search View
  await page.goto('http://localhost:3005/search', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scripts/search_1_to_1_knot.png' });
  console.log('Saved search_1_to_1_knot.png');

  // 2. Click chip 'Relaxed Joggers'
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('Relaxed Joggers')) {
      await b.click();
      console.log('Clicked Relaxed Joggers');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/search_chip_clicked.png' });
  console.log('Saved search_chip_clicked.png');

  // 3. Clear and type 'jeans'
  await page.goto('http://localhost:3005/search', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.focus('input');
  await page.keyboard.type('shirt');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/search_query_results.png' });
  console.log('Saved search_query_results.png');

  await browser.close();
})().catch(console.error);
