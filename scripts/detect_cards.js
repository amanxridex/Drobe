const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function extractCards() {
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

  const cardImages = await page.evaluate(async (dataUri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Let's inspect the cards row:
        // Category cards start at approx y = 264 to y = 348 (height ~ 84px)
        // Labels are at y = 352 to 366
        // Let's find the card boxes:
        // In width 450, 5 cards:
        // Card 1: Ethnic Wear ~ x: 21 to 96 (w=75)
        // Card 2: Dresses ~ x: 111 to 186 (w=75)
        // Card 3: Bottom Wear ~ x: 201 to 276 (w=75)
        // Card 4: Top Wear ~ x: 291 to 366 (w=75)
        // Card 5: Foot Wear ~ x: 381 to 450 (or ~375 to 450)
        
        // Let's sample horizontal row at y = 300 to see where pixels are not dark
        const rowData = [];
        for (let x = 0; x < img.width; x++) {
          const p = ctx.getImageData(x, 300, 1, 1).data;
          rowData.push({ x, r: p[0], g: p[1], b: p[2] });
        }

        resolve({ rowData });
      };
      img.src = dataUri;
    });
  }, dataUri);

  // Group cards based on brightness in rowData
  console.log('Sample row analysis:');
  const brightRuns = [];
  let currentRun = null;
  cardImages.rowData.forEach(({ x, r, g, b }) => {
    const isBright = (r + g + b) > 100;
    if (isBright) {
      if (!currentRun) currentRun = { start: x, end: x };
      else currentRun.end = x;
    } else {
      if (currentRun && currentRun.end - currentRun.start > 15) {
        brightRuns.push(currentRun);
      }
      currentRun = null;
    }
  });
  if (currentRun && currentRun.end - currentRun.start > 15) {
    brightRuns.push(currentRun);
  }

  console.log('Detected item positions:', brightRuns);
  await browser.close();
}

extractCards().catch(console.error);
