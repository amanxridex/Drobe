const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html><body>
      <canvas id="c1" width="128" height="128"></canvas>
      <canvas id="c2" width="128" height="128"></canvas>
      <script>
        window.cropImage = function(src, sx, sy, sw, sh, canvasId) {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.getElementById(canvasId);
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/png'));
            };
            img.src = src;
          });
        };
      </script>
    </body></html>
  `);

  const bMen = fs.readFileSync('public/assets/images/men_with_pic_unselected_dark.webp').toString('base64');
  const bWomen = fs.readFileSync('public/assets/images/women_with_pic_unselected_dark.webp').toString('base64');

  // Coordinates of head in men_with_pic_unselected_dark.webp (448x248)
  const menData = await page.evaluate(async (b64) => {
    return await window.cropImage('data:image/webp;base64,' + b64, 40, 20, 110, 110, 'c1');
  }, bMen);

  // Coordinates of head in women_with_pic_unselected_dark.webp (448x248)
  const womenData = await page.evaluate(async (b64) => {
    return await window.cropImage('data:image/webp;base64,' + b64, 298, 20, 110, 110, 'c2');
  }, bWomen);

  fs.writeFileSync('public/assets/images/knot_avatar_men_clean.png', Buffer.from(menData.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync('public/assets/images/knot_avatar_women_clean.png', Buffer.from(womenData.replace(/^data:image\/png;base64,/, ''), 'base64'));

  console.log('Successfully created clean avatars!');
  await browser.close();
})();
