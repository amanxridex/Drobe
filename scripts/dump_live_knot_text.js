const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 950, deviceScaleFactor: 2 });
  
  await page.goto('https://knotnow.co/product/12886', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const pageDetails = await page.evaluate(() => {
    return {
      bodyText: document.body.innerText,
      htmlSample: document.body.innerHTML.slice(0, 10000)
    };
  });

  fs.writeFileSync('scripts/knot_12886_live_text.txt', pageDetails.bodyText);
  console.log('Saved live text. Total length:', pageDetails.bodyText.length);
  await browser.close();
})();
