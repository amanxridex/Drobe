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
  await new Promise(r => setTimeout(r, 2000));

  const navHandle = await page.$('nav');
  if (navHandle) {
    await navHandle.screenshot({ path: 'C:/Users/User/Drobe/scripts/verified_bottom_nav.png' });
    console.log('Saved verified_bottom_nav.png');
  } else {
    console.log('nav selector not found, dumping links');
    const links = await page.$$eval('a', as => as.map(a => a.textContent.trim()));
    console.log('Links:', links);
  }
  await browser.close();
})();
