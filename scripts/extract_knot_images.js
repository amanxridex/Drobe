const https = require('https');
const fs = require('fs');

https.get('https://knotnow.co/product/12886', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const urls = [...body.matchAll(/https:\/\/ik\.imagekit\.io\/slickapp\/[^\s\"\'<>]+/g)].map(m => m[0]);
    const unique = [...new Set(urls)];
    console.log(`Found ${unique.length} unique ImageKit URLs`);
    fs.writeFileSync('scripts/knot_urls.json', JSON.stringify(unique, null, 2));
    unique.slice(0, 15).forEach(u => console.log(u));
  });
});
