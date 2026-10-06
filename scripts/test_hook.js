const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testHook() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    args: ['--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const interceptedObjects = [];

  // Expose a function to receive intercepted parsed JSON
  await page.exposeFunction('onInterceptedJson', (data) => {
    try {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      if (str.includes('product') || str.includes('brand') || str.includes('image') || str.includes('price')) {
        console.log('INTERCEPTED REAL DATA! Length:', str.length);
        interceptedObjects.push(data);
      }
    } catch (e) {}
  });

  // Inject before any script loads
  await page.evaluateOnNewDocument(() => {
    const origParse = JSON.parse;
    JSON.parse = function (text, reviver) {
      const res = origParse.call(this, text, reviver);
      if (typeof text === 'string' && (text.includes('product') || text.includes('brand') || text.includes('items') || text.includes('imagekit'))) {
        try {
          window.onInterceptedJson(res);
        } catch (e) {}
      }
      return res;
    };
  });

  console.log('Navigating to knotnow.co...');
  await page.goto('https://knotnow.co/', { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 12000));

  console.log(`Total intercepted JSON objects: ${interceptedObjects.length}`);
  fs.writeFileSync('C:\\Users\\User\\Drobe\\scripts\\intercepted_test.json', JSON.stringify(interceptedObjects, null, 2));

  await browser.close();
}

testHook().catch(err => {
  console.error(err);
  process.exit(1);
});
