const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('Launching browser to verify dual-gender separation...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. Load Men Mode
  console.log('Loading Men Mode...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 25000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/verified_our_men_mode.png' });
  console.log('Saved verified_our_men_mode.png');

  // 2. Click Gender Toggle Pill to switch to Women Mode
  console.log('Clicking Gender Toggle to switch to Women Mode...');
  // The toggle pill is in row 2 of header, click at x=75, y=65
  const toggleEl = await page.$('header > div:nth-child(2) > div:first-child');
  if (toggleEl) {
    await toggleEl.click();
  } else {
    await page.touchscreen.tap(75, 65);
  }
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'scripts/verified_our_women_mode.png' });
  console.log('Saved verified_our_women_mode.png');

  // 3. Scroll down in Women Mode to inspect mid sections
  console.log('Scrolling Women Mode down...');
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollBy(0, 480);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/verified_our_women_scroll_1.png' });
  console.log('Saved verified_our_women_scroll_1.png');

  // 4. Scroll further down to inspect curated brand rails and product grid
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollBy(0, 600);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/verified_our_women_scroll_2.png' });
  console.log('Saved verified_our_women_scroll_2.png');

  // 5. Scroll further down to inspect Trending products
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollBy(0, 700);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/verified_our_women_scroll_3.png' });
  console.log('Saved verified_our_women_scroll_3.png');

  await browser.close();
  console.log('Verification run complete!');
}

main().catch(console.error);
