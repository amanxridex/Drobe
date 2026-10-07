const fs = require('fs');
const path = require('path');
const https = require('https');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);

function findBloc(blocId) {
  for (const entry of data) {
    if (entry && entry.component_data) {
      for (const k of Object.keys(entry.component_data)) {
        const obj = entry.component_data[k];
        if (obj && (obj.bloc_id === blocId || obj.id === blocId)) {
          return obj;
        }
      }
    }
  }
  return null;
}

const toCheck = [];

// 1. banner_1923_hp_men
const b1923 = findBloc('banner_1923_hp_men');
if (b1923 && b1923.items?.[0]?.image_media?.media_url) {
  toCheck.push({
    name: 'banner_1923_bonkers.webp',
    url: b1923.items[0].image_media.media_url.l || b1923.items[0].image_media.media_url.d
  });
}

// 2. coupon_carousel
toCheck.push({
  name: 'coupon_carousel_vto.png',
  url: 'https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp,w-375/app_images%2Fhome_page_Virtual_Try_On.png?ik-t=9999999999&ik-s=2780c6b490bded3b0067162650a5a599dde6679b'
});

// 3. grid_858 (Iconic Looks)
const g858 = findBloc('grid_858');
if (g858 && g858.items) {
  g858.items.forEach((item, idx) => {
    toCheck.push({
      name: `iconic_${idx}.png`,
      url: item.image_media?.media_url?.l || item.image_media?.media_url?.d,
      alt: item.image_media?.alt,
      deeplink: item.deeplink
    });
  });
}

// 4. row_861 (Latest Drops)
const r861 = findBloc('row_861');
if (r861 && r861.items) {
  r861.items.forEach((item, idx) => {
    toCheck.push({
      name: `latest_${idx}.webp`,
      url: item.image_media?.media_url?.l || item.image_media?.media_url?.d,
      alt: item.image_media?.alt,
      deeplink: item.deeplink
    });
  });
}

// 5. grid_1643 (Offers)
const g1643 = findBloc('grid_1643');
if (g1643 && g1643.items) {
  g1643.items.forEach((item, idx) => {
    toCheck.push({
      name: `offer_${idx}.webp`,
      url: item.image_media?.media_url?.l || item.image_media?.media_url?.d,
      alt: item.image_media?.alt,
      deeplink: item.deeplink
    });
  });
}

console.log(`Total images to check/download: ${toCheck.length}`);

// Download missing
const targetDir = path.join(__dirname, '../public/assets/real/home_sections');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`Exists: ${path.basename(dest)}`);
      return resolve();
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      console.error(`Error downloading ${url}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  for (const item of toCheck) {
    if (item.url) {
      const dest = path.join(targetDir, item.name);
      await download(item.url, dest);
    }
  }
  // Write manifest
  fs.writeFileSync('data/home_sections_manifest.json', JSON.stringify(toCheck, null, 2));
  console.log('Saved data/home_sections_manifest.json!');
}

run();
