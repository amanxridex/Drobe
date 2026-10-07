const fs = require('fs');
const path = require('path');
const https = require('https');

const manifestPath = path.join(__dirname, '../data/discover_brands_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const brandsDir = path.join(__dirname, '../public/assets/real/brands');

if (!fs.existsSync(brandsDir)) {
  fs.mkdirSync(brandsDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) {
      return resolve(true);
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      console.error(`Error downloading ${url}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  let count = 0;
  for (let sIdx = 0; sIdx < manifest.slides.length; sIdx++) {
    const slide = manifest.slides[sIdx];
    for (let bIdx = 0; bIdx < slide.length; bIdx++) {
      const brand = slide[bIdx];
      const filename = `brand_s${sIdx}_${bIdx}.webp`;
      const localRelPath = `/assets/real/brands/${filename}`;
      const dest = path.join(brandsDir, filename);

      if (brand.img && brand.img.startsWith('http')) {
        await download(brand.img, dest);
        brand.img = localRelPath;
        count++;
      }
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Downloaded ${count} brand logos and updated discover_brands_manifest.json!`);
}

run();
