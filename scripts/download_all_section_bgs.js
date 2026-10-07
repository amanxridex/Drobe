const fs = require('fs');
const path = require('path');
const https = require('https');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'intercepted_test.json'), 'utf8'));

const outDir = path.join(__dirname, '..', 'public', 'assets', 'real', 'section_bgs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function main() {
  const downloadTasks = [];

  for (let i = 14; i <= 42; i++) {
    const item = data[i];
    if (!item?.component_data) continue;
    const rowComp = item.component_data.find(c => c.bloc_id?.startsWith('product_row'));
    if (!rowComp) continue;

    const bgUrl = rowComp.background_media?.media_url?.l || rowComp.background_media?.media_url?.d || rowComp.background_media?.url;
    if (!bgUrl) continue;

    const filename = `bg_sec_${rowComp.id}.webp`;
    const dest = path.join(outDir, filename);

    downloadTasks.push({ id: rowComp.id, url: bgUrl, dest, filename });
  }

  console.log(`Found ${downloadTasks.length} background images to download.`);

  for (const task of downloadTasks) {
    try {
      if (fs.existsSync(task.dest) && fs.statSync(task.dest).size > 1000) {
        console.log(`[EXISTS] Sec ${task.id} -> ${task.filename} (${fs.statSync(task.dest).size} bytes)`);
        continue;
      }
      console.log(`[DOWNLOADING] Sec ${task.id} -> ${task.filename}...`);
      await downloadUrl(task.url, task.dest);
      const size = fs.statSync(task.dest).size;
      console.log(`[SUCCESS] Sec ${task.id} downloaded (${size} bytes)`);
    } catch (err) {
      console.error(`[ERROR] Sec ${task.id} failed:`, err.message);
    }
  }

  console.log('All downloads completed!');
}

main().catch(console.error);
