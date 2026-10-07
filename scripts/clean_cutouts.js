const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cleanCutouts() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const sourcePath = 'C:/Users/vinod/.gemini/antigravity-ide/brain/7501387e-21a8-46a5-a050-38c041249a52/.user_uploaded/media_1791309030061.png';
  const imgBase64 = fs.readFileSync(sourcePath).toString('base64');
  const dataUri = 'data:image/png;base64,' + imgBase64;

  await page.setContent('<canvas id="cv"></canvas>');

  const cleanData = await page.evaluate(async (uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const cardDefs = [
          { name: 'ethnic', x: 25, y: 270, w: 67, h: 74 },
          { name: 'dresses', x: 115, y: 270, w: 67, h: 74 },
          { name: 'bottom', x: 205, y: 270, w: 67, h: 74 },
          { name: 'top', x: 295, y: 270, w: 67, h: 74 },
          { name: 'footwear', x: 384, y: 270, w: 64, h: 74 }
        ];

        const out = {};
        for (const def of cardDefs) {
          const tempCv = document.createElement('canvas');
          tempCv.width = def.w;
          tempCv.height = def.h;
          const tempCtx = tempCv.getContext('2d');
          tempCtx.drawImage(cv, def.x, def.y, def.w, def.h, 0, 0, def.w, def.h);

          const imgData = tempCtx.getImageData(0, 0, def.w, def.h);
          const d = imgData.data;

          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i+1], b = d[i+2];
            const yPixel = Math.floor((i / 4) / def.w);

            // Cut off any border at the bottom
            if (yPixel >= def.h - 4) {
              d[i+3] = 0;
              continue;
            }

            // If background (dark/black or deep magenta glow)
            // Clothes are light colors: white, cream, peach, pink, beige
            // Max of RGB < 120 or (r < 140 && g < 75 && b < 80)
            const isDark = (r < 115 && g < 100 && b < 105);
            const isMagentaGlow = (r > 30 && r < 145 && g < 60 && b < 85);
            if (isDark || isMagentaGlow) {
              d[i+3] = 0;
            }
          }

          tempCtx.putImageData(imgData, 0, 0);
          out[def.name] = tempCv.toDataURL('image/png');
        }

        resolve(out);
      };
      img.src = uri;
    });
  }, dataUri);

  for (const [key, data] of Object.entries(cleanData)) {
    const b64 = data.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(`public/assets/real/cat_women_${key}_clean.png`, b64, 'base64');
  }

  console.log('Saved clean cutouts!');
  await browser.close();
}

cleanCutouts().catch(console.error);
