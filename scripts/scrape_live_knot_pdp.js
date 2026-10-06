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
  
  const images = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('imagekit.io/slickapp') && (url.includes('.jpg') || url.includes('.webp') || url.includes('.png'))) {
      images.push(url);
    }
  });

  try {
    await page.goto('https://knotnow.co/product/12886', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const pageData = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).map(img => img.src);
      return {
        title: document.title,
        imgs: imgs
      };
    });

    console.log('Intercepted images:', images.length);
    console.log('DOM images:', pageData.imgs.length);

    fs.writeFileSync('scripts/knot_pdp_12886_intercepted.json', JSON.stringify({
      intercepted: images,
      dom: pageData.imgs
    }, null, 2));

  } catch (err) {
    console.error('Error fetching knot page:', err.message);
  } finally {
    await browser.close();
  }
})();
