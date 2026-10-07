const fs = require('fs');

const urls = JSON.parse(fs.readFileSync('scripts/knot_women_all_urls.json', 'utf8'));

console.log('Total URLs:', urls.length);
urls.forEach((url, i) => {
  // simplify url for reading
  try {
    const u = new URL(url);
    const pathname = decodeURIComponent(u.pathname);
    console.log(`[${i}] ${pathname}`);
  } catch (e) {
    console.log(`[${i}] ${url.substring(0, 80)}`);
  }
});
