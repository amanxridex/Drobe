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

  const cardCrops = await page.evaluate(async (dataUri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Card box boundaries in the 450x372 image:
        // Top of cards: y = 266, Bottom of cards: y = 348 (height: 82)
        // 5 cards:
        // Card 1: x = 21, w = 74
        // Card 2: x = 112, w = 74
        // Card 3: x = 202, w = 74
        // Card 4: x = 292, w = 74
        // Card 5: x = 382, w = 68 (last card slightly cropped at right edge or full)
        
        const cardDefs = [
          { name: 'ethnic', x: 21, y: 266, w: 75, h: 83 },
          { name: 'dresses', x: 111, y: 266, w: 75, h: 83 },
          { name: 'bottom', x: 201, y: 266, w: 75, h: 83 },
          { name: 'top', x: 291, y: 266, w: 75, h: 83 },
          { name: 'footwear', x: 381, y: 266, w: 68, h: 83 }
        ];

        // Also let's extract just the clothing items inside each card (inner crop without dotted border)
        // inside each card, inner is x+4, y+4, w-8, h-8
        const items = cardDefs.map(def => {
          const tempCv = document.createElement('canvas');
          tempCv.width = def.w;
          tempCv.height = def.h;
          const tempCtx = tempCv.getContext('2d');
          tempCtx.drawImage(cv, def.x, def.y, def.w, def.h, 0, 0, def.w, def.h);
          return {
            name: def.name,
            cardData: tempCv.toDataURL('image/png')
          };
        });

        // Also extract clothing cutout inside each card (with black background made transparent if desired, or kept crisp)
        const cutouts = cardDefs.map(def => {
          const tempCv = document.createElement('canvas');
          // inner:
          const ix = def.x + 3;
          const iy = def.y + 3;
          const iw = def.w - 6;
          const ih = def.h - 6;
          tempCv.width = iw;
          tempCv.height = ih;
          const tempCtx = tempCv.getContext('2d');
          tempCtx.drawImage(cv, ix, iy, iw, ih, 0, 0, iw, ih);

          // Get image data and make the black/dark card background transparent
          const imgData = tempCtx.getImageData(0, 0, iw, ih);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i+1], b = d[i+2];
            // If near black (the background of the card)
            // Note: the bottom of the card has a dark magenta glow (r~40-90, g~5-20, b~30-50)
            // But the clothing item itself is white, cream, peach, or beige (r>130, g>110, b>100)
            if (r < 110 && g < 70 && b < 80) {
              // Fade to transparent
              d[i+3] = 0;
            }
          }
          tempCtx.putImageData(imgData, 0, 0);

          return {
            name: def.name,
            cutoutData: tempCv.toDataURL('image/png')
          };
        });

        resolve({ items, cutouts });
      };
      img.src = dataUri;
    });
  }, dataUri);

  // Save the cropped card files
  cardCrops.items.forEach(c => {
    const base64Data = c.cardData.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(`public/assets/real/cat_women_${c.name}_card.png`, base64Data, 'base64');
  });

  cardCrops.cutouts.forEach(c => {
    const base64Data = c.cutoutData.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(`public/assets/real/cat_women_${c.name}_cutout.png`, base64Data, 'base64');
  });

  console.log('Saved 5 cards and cutouts successfully!');
  await browser.close();
}

extractCards().catch(console.error);
