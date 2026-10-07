const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function check() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('public/assets/real/hero_slice_02_sale.webp').toString('base64');
  await page.setContent('<canvas id="cv"></canvas>');

  const info = await page.evaluate(async (uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Check at x = 100 (where the pearl line is) for y from 80 to 140
        const pearlY = [];
        for (let y = 80; y < 140; y++) {
          const p = ctx.getImageData(100, y, 1, 1).data;
          pearlY.push({ y, r: p[0], g: p[1], b: p[2] });
        }

        // Check at x = 375 (center of hexagonal badge) for y from 80 to 140
        const badgeY = [];
        for (let y = 80; y < 156; y++) {
          const p = ctx.getImageData(375, y, 1, 1).data;
          badgeY.push({ y, r: p[0], g: p[1], b: p[2] });
        }

        resolve({ pearlY, badgeY });
      };
      img.src = uri;
    });
  }, 'data:image/webp;base64,' + b64);

  // Find pearl row
  const brightPearls = info.pearlY.filter(p => p.r > 150 && p.g > 150 && p.b > 150);
  console.log('Pearl rows:', brightPearls);
  // Find badge bottom
  const badgeBottom = info.badgeY.filter(p => p.r > 100 || p.b > 100);
  console.log('Badge last bright Y:', badgeBottom[badgeBottom.length - 1]);

  await browser.close();
}

check().catch(console.error);
