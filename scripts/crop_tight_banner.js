const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cropTight() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('public/assets/real/hero_slice_02_sale_merged.png').toString('base64');
  await page.setContent('<canvas id="cv"></canvas>');

  const result = await page.evaluate(async (uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        // Crop exactly to y=136 so it ends right at the bottom edge of the glowing badge
        cv.width = img.width;
        cv.height = 136;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, 136, 0, 0, img.width, 136);
        resolve(cv.toDataURL('image/png'));
      };
      img.src = uri;
    });
  }, 'data:image/png;base64,' + b64);

  const pngB64 = result.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync('public/assets/real/hero_slice_02_sale_merged_tight.png', pngB64, 'base64');
  console.log('Saved hero_slice_02_sale_merged_tight.png');
  await browser.close();
}

cropTight().catch(console.error);
