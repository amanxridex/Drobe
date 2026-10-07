const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,932']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3005/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll down
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 530;
  });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll category container to slide 2
  await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('main section'));
    const catSec = sections.find(s => s.innerHTML.includes('Kurtas'));
    if (catSec) {
      const scrollEl = catSec.querySelector('div');
      if (scrollEl) {
        scrollEl.scrollLeft = 390;
        scrollEl.dispatchEvent(new Event('scroll'));
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'scripts/verify_category_slide_2.png' });
  console.log('Saved scripts/verify_category_slide_2.png');

  // Now click the referral banner to open modal
  await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('main section'));
    const refSec = sections.find(s => s.innerHTML.includes('referral_tote_banner'));
    if (refSec) {
      const clickable = refSec.querySelector('div');
      if (clickable) clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'scripts/verify_referral_modal.png' });
  console.log('Saved scripts/verify_referral_modal.png');

  await browser.close();
})();
