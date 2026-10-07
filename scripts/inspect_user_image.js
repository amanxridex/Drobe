const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function crop() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const sourcePath = 'C:/Users/vinod/.gemini/antigravity-ide/brain/7501387e-21a8-46a5-a050-38c041249a52/.user_uploaded/media_1791309030061.png';
  const imgBase64 = fs.readFileSync(sourcePath).toString('base64');
  const dataUri = 'data:image/png;base64,' + imgBase64;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:black;">
        <canvas id="cv"></canvas>
      </body>
    </html>
  `);

  const results = await page.evaluate(async (dataUri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Let's find pixel colors along the vertical center
        const colData = [];
        for (let y = 0; y < img.height; y += 10) {
          const pixel = ctx.getImageData(img.width / 2, y, 1, 1).data;
          colData.push({ y, r: pixel[0], g: pixel[1], b: pixel[2] });
        }

        // We know:
        // Width: 450, Height: 372
        // Pearl divider is around y = 220 to 240
        // Category cards start around y = 265, card height is ~75, labels around y = 350
        resolve({
          w: img.width,
          h: img.height,
          colData
        });
      };
      img.src = dataUri;
    });
  }, dataUri);

  console.log('Results:', results.w, results.h);
  console.log('Vertical sample:', results.colData);

  await browser.close();
}

crop().catch(console.error);
