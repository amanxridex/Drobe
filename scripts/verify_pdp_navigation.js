const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPDP() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });

  // Test PDP for 19401 (Chumbak Cushion)
  console.log('Navigating to /product/19401 ...');
  await page.goto('http://localhost:3005/product/19401', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.resolve(__dirname, 'test_pdp_19401_chumbak.png') });
  console.log('Saved test_pdp_19401_chumbak.png');

  // Test PDP for 35266 (Thomas Scott Shacket)
  console.log('Navigating to /product/35266 ...');
  await page.goto('http://localhost:3005/product/35266', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.resolve(__dirname, 'test_pdp_35266_thomas_scott.png') });
  console.log('Saved test_pdp_35266_thomas_scott.png');

  await browser.close();
  console.log('PDP verification completed successfully!');
}

testPDP().catch(console.error);
