const fs = require('fs');

const mapping = JSON.parse(fs.readFileSync('scripts/women_downloaded_mapping.json', 'utf8'));

// Brand logos are usually square or circular logos
console.log('Mapping count:', mapping.length);
mapping.forEach(m => {
  if (m.url.includes('w-77') || m.url.includes('brand') || m.filename.includes('logo')) {
    console.log(`[${m.index}] ${m.filename} -> ${m.url}`);
  }
});
