const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function extractOnlyFestiveForeground() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('public/assets/real/hero_slice_02_sale.webp').toString('base64');
  await page.setContent('<canvas id="cv"></canvas>');

  const result = await page.evaluate(async (uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        cv.width = img.width;
        cv.height = 140; // Crop to pearl/badge bottom
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
        const d = imgData.data;

        // The background in hero_slice_02 is magenta (r: 100-185, g: 5-40, b: 60-120) or dark/black at bottom
        // The foreground elements are:
        // 1. "FREAKIN' FESTIVE SALE": white/bright pink text with glow (r > 210, g > 80, b > 180 or white r>240,g>230,b>240)
        // 2. Hexagonal badge: white pill with pink glow and dark red text
        // 3. Pearl strings: bright white/pink pearls (r > 200, g > 150, b > 200)

        // Let's test a color-distance / chroma key approach or difference from background
        // First let's check what pixels belong to background
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i+1], b = d[i+2];
          
          // Pure magenta background without text/glow has low green (g < 45) and r < 185
          // Text and glow has high brightness or high green (g > 60) or very bright pink (r > 220)
          const isText = (r > 210 && g > 90) || (r > 230 && b > 200);
          const isGlow = (r > 195 && g > 45 && b > 140);
          const isBadge = (r > 180 && g > 140 && b > 180);
          const isBadgeText = (r > 120 && r < 170 && g < 40 && b < 100 && i > (85 * cv.width * 4)); // Inside badge

          // If it's pure background
          if (!isText && !isGlow && !isBadge && !isBadgeText) {
            d[i+3] = 0; // Transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(cv.toDataURL('image/png'));
      };
      img.src = uri;
    });
  }, 'data:image/webp;base64,' + b64);

  const pngB64 = result.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync('public/assets/real/festive_foreground_only.png', pngB64, 'base64');
  console.log('Saved festive_foreground_only.png');
  await browser.close();
}

extractOnlyFestiveForeground().catch(console.error);
