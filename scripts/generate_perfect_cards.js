const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function generatePerfectCards() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Load the 5 cards from media_1791309030061.png
  // For footwear, we composite the footwear cutout on a perfect 75x83 card with the exact bottom magenta glow and dotted border
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

  const cardsData = await page.evaluate(async (dataUri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Crop the 4 full cards from original:
        // Ethnic: x=21, y=266, w=75, h=83
        // Dresses: x=111, y=266, w=75, h=83
        // Bottom: x=201, y=266, w=75, h=83
        // Top: x=291, y=266, w=75, h=83
        // Footwear: x=381, y=266, w=68 (orig width) -> let's make it a 75x83 card!

        const fullCv = document.createElement('canvas');
        fullCv.width = img.width;
        fullCv.height = img.height;
        const fullCtx = fullCv.getContext('2d');
        fullCtx.drawImage(img, 0, 0);

        function getCard(x, y, w, h) {
          const cv = document.createElement('canvas');
          cv.width = 75;
          cv.height = 83;
          const ctx = cv.getContext('2d');

          if (w < 75) {
            // For footwear: draw a base with dotted pink border and radial magenta glow
            ctx.fillStyle = '#0f0f12';
            ctx.beginPath();
            ctx.roundRect(1, 1, 73, 81, 12);
            ctx.fill();

            // Bottom radial magenta glow
            const grad = ctx.createRadialGradient(37, 80, 2, 37, 75, 45);
            grad.addColorStop(0, 'rgba(180, 15, 80, 0.55)');
            grad.addColorStop(0.7, 'rgba(120, 10, 50, 0.2)');
            grad.addColorStop(1, 'rgba(15, 15, 18, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(1, 1, 73, 81, 12);
            ctx.fill();

            // Draw dotted border
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
            ctx.setLineDash([2, 2.5]);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(1, 1, 73, 81, 12);
            ctx.stroke();

            // Draw the shoes image centered
            // From orig x=381, y=266, w=68, h=83
            // The shoes are in the center
            ctx.drawImage(img, x + 3, y + 4, w - 6, h - 8, 4, 6, 67, 73);
          } else {
            ctx.drawImage(img, x, y, w, h, 0, 0, 75, 83);
          }

          return cv.toDataURL('image/png');
        }

        resolve({
          ethnic: getCard(21, 266, 75, 83),
          dresses: getCard(111, 266, 75, 83),
          bottom: getCard(201, 266, 75, 83),
          top: getCard(291, 266, 75, 83),
          footwear: getCard(381, 266, 68, 83)
        });
      };
      img.src = dataUri;
    });
  }, dataUri);

  for (const [key, data] of Object.entries(cardsData)) {
    const b64 = data.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(`public/assets/real/cat_women_${key}_card.png`, b64, 'base64');
  }

  console.log('Saved perfect cards!');
  await browser.close();
}

generatePerfectCards().catch(console.error);
