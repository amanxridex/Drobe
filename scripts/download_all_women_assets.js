const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = JSON.parse(fs.readFileSync('scripts/knot_women_all_urls.json', 'utf8'));

const targetDir = path.resolve('public/assets/real/women');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
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
  const mapping = [];
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    if (!u.includes('imagekit.io') && !u.includes('knotnow.co/assets')) continue;
    
    // Clean name
    const uObj = new URL(u);
    let rawName = decodeURIComponent(path.basename(uObj.pathname));
    if (!rawName.includes('.')) rawName += '.webp';
    rawName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    const dest = path.join(targetDir, `asset_${i}_${rawName}`);
    try {
      await download(u, dest);
      mapping.push({ index: i, url: u, filename: `asset_${i}_${rawName}` });
      console.log(`[${i}/${urls.length}] Downloaded ${rawName}`);
    } catch (e) {
      console.error(`Failed ${u}: ${e.message}`);
    }
  }
  fs.writeFileSync('scripts/women_downloaded_mapping.json', JSON.stringify(mapping, null, 2));
  console.log(`Finished downloading ${mapping.length} assets!`);
})();
