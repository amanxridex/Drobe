const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('public/assets/real/women');

console.log('--- ALL WOMEN ASSETS IN public/assets/real/women/ ---');
files.forEach((f, i) => {
  const stat = fs.statSync(path.join('public/assets/real/women', f));
  console.log(`[${i}] ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
});
