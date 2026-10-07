const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspectKnotSearch() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  console.log('Navigating to knotnow.co ...');
  await page.goto('https://knotnow.co/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 6000));

  // Dismiss location dialog if present
  try {
    await page.mouse.click(200, 100);
  } catch(e) {}
  await new Promise(r => setTimeout(r, 1000));

  // Click the search bar (approx x: 250, y: 105 on home page)
  console.log('Clicking search bar...');
  await page.mouse.click(250, 105);
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: 'scripts/knot_search_page.png' });
  console.log('Saved knot_search_page.png');

  // Also extract text and images on the search page
  const pageData = await page.evaluate(() => {
    return {
      url: window.location.href,
      text: document.body.innerText,
      imgs: Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, alt: i.alt }))
    };
  });

  fs.writeFileSync('scripts/knot_search_data.json', JSON.stringify(pageData, null, 2));
  console.log('Saved knot_search_data.json:', pageData.url);

  await browser.close();
}

inspectKnotSearch().catch(console.error);
