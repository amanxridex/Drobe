const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('scripts/knot_women_api_pages.json', 'utf8'));

console.log('Finding hp_women in knot_women_api_pages...');
pages.forEach((p, idx) => {
  if (p.url.includes('hp_women') || idx === 6) {
    console.log(`Page [${idx}] url: ${p.url}`);
    console.log('text length:', p.text.length);
    console.log('text sample:', p.text.substring(0, 500));
  }
});
