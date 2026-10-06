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
  
  let interceptedData = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('/products/') || url.includes('droplet')) {
      try {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('application/json')) {
          const json = await response.json();
          interceptedData.push({ url, json });
        }
      } catch (e) {}
    }
  });

  try {
    await page.goto('https://knotnow.co/product/12886', { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (e) {
    console.log('Navigation timeout or error, continuing...');
  }

  await new Promise(r => setTimeout(r, 2000));

  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent || '',
      brand: document.querySelector('[class*="brand"], [class*="Brand"]')?.textContent || '',
      price: document.querySelector('[class*="price"], [class*="Price"]')?.textContent || '',
      bodyText: document.body.innerText.slice(0, 1500)
    };
  });

  console.log('Page Info:', JSON.stringify(pageInfo, null, 2));
  console.log('Intercepted JSON endpoints:', interceptedData.map(d => d.url));

  const fs = require('fs');
  fs.writeFileSync('scripts/pdp_12886_dump.json', JSON.stringify({ pageInfo, interceptedData }, null, 2));

  await browser.close();
})();
