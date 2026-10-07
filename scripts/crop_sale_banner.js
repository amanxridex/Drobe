const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cropSaleBanner() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('public/assets/real/hero_slice_02_sale.webp').toString('base64');
  await page.setContent('<canvas id="cv"></canvas>');

  const result = await page.evaluate(async (uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        // Let's crop from y=0 to y=134 (height: 134) to eliminate the black strip at the bottom
        // Or make the black pixels transparent
        cv.width = img.width;
        cv.height = 135;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, 135, 0, 0, img.width, 135);
        resolve(cv.toDataURL('image/png'));
      };
      img.src = uri;
    });
  }, 'data:image/webp;base64,' + b64);

  const pngB64 = result.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync('public/assets/real/hero_slice_02_sale_clean.png', pngB64, 'base64');
  console.log('Saved hero_slice_02_sale_clean.png');
  await browser.close();
}

cropSaleBanner().catch(console.error);
