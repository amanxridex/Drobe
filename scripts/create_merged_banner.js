const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function createMergedBanner() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('public/assets/real/hero_slice_02_sale_transparent.png').toString('base64');
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

        // Smoothly fade the top 24 pixels to transparent
        // from y = 0 (alpha = 0) to y = 24 (alpha = 1)
        for (let y = 0; y < 24; y++) {
          const alphaFactor = Math.pow(y / 24, 1.8);
          for (let x = 0; x < cv.width; x++) {
            const idx = (y * cv.width + x) * 4;
            d[idx + 3] = Math.round(d[idx + 3] * alphaFactor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(cv.toDataURL('image/png'));
      };
      img.src = uri;
    });
  }, 'data:image/png;base64,' + b64);

  const pngB64 = result.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync('public/assets/real/hero_slice_02_sale_merged.png', pngB64, 'base64');
  console.log('Saved hero_slice_02_sale_merged.png');
  await browser.close();
}

createMergedBanner().catch(console.error);
