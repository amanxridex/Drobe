const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function analyzeFullOriginal() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const sourcePath = 'C:/Users/vinod/.gemini/antigravity-ide/brain/7501387e-21a8-46a5-a050-38c041249a52/.user_uploaded/media_1791309030061.png';
  const imgBase64 = fs.readFileSync(sourcePath).toString('base64');
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

        // Let's crop from y = 135 to y = 245 (the exact Festive Sale banner region from Knot)
        const bannerCv = document.createElement('canvas');
        bannerCv.width = img.width;
        bannerCv.height = 110;
        const bCtx = bannerCv.getContext('2d');
        bCtx.drawImage(img, 0, 135, img.width, 110, 0, 0, img.width, 110);

        // Also let's inspect the color at y=135 across x=50, 150, 250, 350
        const topEdge = [50, 150, 250, 350].map(x => {
          const p = ctx.getImageData(x, 135, 1, 1).data;
          return { x, r: p[0], g: p[1], b: p[2] };
        });

        resolve({
          bannerData: bannerCv.toDataURL('image/png'),
          topEdge,
          w: img.width,
          h: img.height
        });
      };
      img.src = uri;
    });
  }, 'data:image/png;base64,' + imgBase64);

  const b64 = result.bannerData.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync('public/assets/real/knot_orig_festive_banner.png', b64, 'base64');
  console.log('Top edge of banner in original Knot:', result.topEdge);
  console.log('Saved knot_orig_festive_banner.png');
  await browser.close();
}

analyzeFullOriginal().catch(console.error);
