const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = JSON.parse(fs.readFileSync('scripts/knot_women_all_urls.json', 'utf8'));

const imgUrls = urls.filter(u => u.includes('IMG_803') || u.includes('IMG_804'));
console.log('Found Lookbook URLs:', imgUrls.length);
imgUrls.forEach((u, i) => console.log(`[${i}] ${u}`));

const targetDir = path.resolve('public/assets/real/women');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

(async () => {
  for (let i = 0; i < imgUrls.length; i++) {
    const u = imgUrls[i];
    const filename = path.basename(new URL(u).pathname);
    const dest = path.join(targetDir, filename);
    console.log(`Downloading ${filename}...`);
    await download(u, dest);
    console.log(`Saved ${dest}`);
  }
})();
