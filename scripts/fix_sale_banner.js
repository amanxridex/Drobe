const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function fixSaleBanner() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('public/assets/real/hero_slice_02_sale.webp').toString('base64');
  await page.setContent('<canvas id="cv"></canvas>');

  const result = await page.evaluate(async (uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
        const d = imgData.data;

        // Any pixel that is black (r < 35 && g < 35 && b < 35) in the bottom portion (y > 100), make it transparent!
        for (let y = 100; y < cv.height; y++) {
          for (let x = 0; x < cv.width; x++) {
            const idx = (y * cv.width + x) * 4;
            const r = d[idx], g = d[idx+1], b = d[idx+2];
            // Black background at bottom
            if (r < 40 && g < 40 && b < 40) {
              d[idx+3] = 0; // Transparent!
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(cv.toDataURL('image/png'));
      };
      img.src = uri;
    });
  }, 'data:image/webp;base64,' + b64);

  const pngB64 = result.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync('public/assets/real/hero_slice_02_sale_transparent.png', pngB64, 'base64');
  console.log('Saved hero_slice_02_sale_transparent.png');
  await browser.close();
}

fixSaleBanner().catch(console.error);
