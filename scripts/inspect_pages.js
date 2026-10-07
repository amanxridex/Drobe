const fs = require('fs');

if (fs.existsSync('scripts/knot_women_api_pages.json')) {
  const pages = JSON.parse(fs.readFileSync('scripts/knot_women_api_pages.json', 'utf8'));
  console.log('knot_women_api_pages count:', pages.length);
  pages.forEach((p, idx) => {
    console.log(`[${idx}] url: ${p.url || ''}`);
    if (p.data) {
      const s = typeof p.data === 'string' ? p.data : JSON.stringify(p.data);
      console.log('  data preview:', s.substring(0, 100));
    }
  });
}
