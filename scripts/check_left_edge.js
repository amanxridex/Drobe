const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkLeftEdge() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const sourcePath = 'C:/Users/vinod/.gemini/antigravity-ide/brain/7501387e-21a8-46a5-a050-38c041249a52/.user_uploaded/media_1791309030061.png';
  const imgBase64 = fs.readFileSync(sourcePath).toString('base64');
  await page.setContent('<canvas id="cv"></canvas>');

  const samples = await page.evaluate(async (uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const out = [];
        for (let y = 60; y <= 220; y += 10) {
          const p = ctx.getImageData(8, y, 1, 1).data;
          out.push({ y, r: p[0], g: p[1], b: p[2] });
        }
        resolve(out);
      };
      img.src = uri;
    });
  }, 'data:image/png;base64,' + imgBase64);

  console.log('Original Knot pixels at left edge (x=8):', samples);
  await browser.close();
}

checkLeftEdge().catch(console.error);
