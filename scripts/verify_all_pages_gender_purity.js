const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verify() {
  console.log('Launching browser for comprehensive verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. Visit Home (Men mode)
  console.log('Navigating to http://localhost:3005/ ...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.setItem('drobe_gender', 'men');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_men_home.png') });
  console.log('Saved test_page_men_home.png');

  // 2. Click toggle button to switch to Women Mode
  console.log('Clicking #gender-toggle-button to switch to Women mode...');
  await page.click('#gender-toggle-button');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_home.png') });
  console.log('Saved test_page_women_home.png');

  // 3. Women Collection Page (/collection/ethnic)
  console.log('Navigating to Women /collection/ethnic ...');
  await page.goto('http://localhost:3005/collection/ethnic', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_collection_ethnic.png') });
  console.log('Saved test_page_women_collection_ethnic.png');

  // 4. Women Dresses Collection (/collection/dresses)
  console.log('Navigating to Women /collection/dresses ...');
  await page.goto('http://localhost:3005/collection/dresses', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_collection_dresses.png') });
  console.log('Saved test_page_women_collection_dresses.png');

  // 5. Categories Page (/categories)
  console.log('Navigating to /categories ...');
  await page.goto('http://localhost:3005/categories', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_categories.png') });
  console.log('Saved test_page_women_categories.png');

  // 6. Search Page (/search)
  console.log('Navigating to /search ...');
  await page.goto('http://localhost:3005/search', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_search.png') });
  console.log('Saved test_page_women_search.png');

  // Type in search query "dress"
  console.log('Searching for "dress"...');
  await page.type('input[type="text"]', 'dress');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_search_results.png') });
  console.log('Saved test_page_search_results.png');

  // 7. Product Detail Page (/product/w-eth-1)
  console.log('Navigating to /product/w-eth-1 ...');
  await page.goto('http://localhost:3005/product/w-eth-1', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_pdp.png') });
  console.log('Saved test_page_women_pdp.png');

  // Scroll main container to verify "Style it with" and "Similar products"
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 900;
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_pdp_style.png') });
  console.log('Saved test_page_women_pdp_style.png');

  // 8. Trends Page (/trends)
  console.log('Navigating to /trends ...');
  await page.goto('http://localhost:3005/trends', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve(__dirname, 'test_page_women_trends.png') });
  console.log('Saved test_page_women_trends.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

verify().catch(console.error);
