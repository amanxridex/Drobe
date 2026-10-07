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
        const samples = [];
        for (let y = 0; y < img.height; y += 10) {
          const p = ctx.getImageData(img.width/2, y, 1, 1).data;
          samples.push({ y, r: p[0], g: p[1], b: p[2] });
        }
        resolve({ w: img.width, h: img.height, samples });
      };
      img.src = uri;
    });
  }, 'data:image/webp;base64,' + b64);
  console.log('w:', info.w, 'h:', info.h);
  console.log('samples:', info.samples);
  await browser.close();
}

check().catch(console.error);
