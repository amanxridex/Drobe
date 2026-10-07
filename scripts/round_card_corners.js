const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function makeCardsTransparentCorners() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const cards = ['ethnic', 'dresses', 'bottom', 'top', 'footwear'];

  for (const name of cards) {
    const filePath = `public/assets/real/cat_women_${name}_card.png`;
    const b64 = fs.readFileSync(filePath).toString('base64');

    await page.setContent('<canvas id="cv"></canvas>');

    const roundedB64 = await page.evaluate(async (uri) => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const cv = document.getElementById('cv');
          cv.width = img.width;
          cv.height = img.height;
          const ctx = cv.getContext('2d');

          // Clip to rounded rectangle with radius 12
          ctx.beginPath();
          ctx.roundRect(1, 1, img.width - 2, img.height - 2, 12);
          ctx.clip();

          ctx.drawImage(img, 0, 0);
          resolve(cv.toDataURL('image/png'));
        };
        img.src = uri;
      });
    }, 'data:image/png;base64,' + b64);

    const cleanPng = roundedB64.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(filePath, cleanPng, 'base64');
  }

  console.log('Clipped all cards with transparent corners!');
  await browser.close();
}

makeCardsTransparentCorners().catch(console.error);
