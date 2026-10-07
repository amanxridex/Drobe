const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080']
  });

  // 1. DESKTOP TEST
  console.log('Testing Desktop (1920x1080)...');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1920, height: 1080 });
  await desktopPage.goto('http://localhost:3005/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  const desktopMetrics = await desktopPage.evaluate(() => {
    const wrapper = document.getElementById('app-desktop-wrapper');
    const frame = document.getElementById('mobile-app-frame');
    const qr = document.getElementById('qr-download-card');
    const social = document.getElementById('social-links-card');

    return {
      wrapperBg: wrapper ? window.getComputedStyle(wrapper).backgroundColor : null,
      frameWidth: frame ? frame.offsetWidth : null,
      frameMaxWidth: frame ? window.getComputedStyle(frame).maxWidth : null,
      frameLeft: frame ? frame.getBoundingClientRect().left : null,
      qrDisplay: qr ? window.getComputedStyle(qr).display : null,
      qrVisible: qr ? (qr.getBoundingClientRect().width > 0) : false,
      socialDisplay: social ? window.getComputedStyle(social).display : null,
      socialVisible: social ? (social.getBoundingClientRect().width > 0) : false
    };
  });

  console.log('Desktop Metrics:', JSON.stringify(desktopMetrics, null, 2));
  await desktopPage.screenshot({ path: 'scripts/desktop_final_verification.png' });
  console.log('Saved scripts/desktop_final_verification.png');
  await desktopPage.close();

  // 2. MOBILE TEST
  console.log('Testing Mobile (390x844)...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3005/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  const mobileMetrics = await mobilePage.evaluate(() => {
    const frame = document.getElementById('mobile-app-frame');
    const qr = document.getElementById('qr-download-card');
    const social = document.getElementById('social-links-card');
    const bottomNav = document.querySelector('nav');

    return {
      frameWidth: frame ? frame.offsetWidth : null,
      frameMaxWidth: frame ? window.getComputedStyle(frame).maxWidth : null,
      qrDisplay: qr ? window.getComputedStyle(qr).display : null,
      socialDisplay: social ? window.getComputedStyle(social).display : null,
      bottomNavVisible: bottomNav ? (bottomNav.getBoundingClientRect().height > 0) : false
    };
  });

  console.log('Mobile Metrics:', JSON.stringify(mobileMetrics, null, 2));
  await mobilePage.screenshot({ path: 'scripts/mobile_final_verification.png' });
  console.log('Saved scripts/mobile_final_verification.png');
  await mobilePage.close();

  await browser.close();
})();
