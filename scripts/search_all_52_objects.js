const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_women_full.json', 'utf8'));

console.log('Inspecting all 52 objects in intercepted_women_full.json:');
data.forEach((obj, idx) => {
  const str = JSON.stringify(obj);
  const keys = obj && typeof obj === 'object' ? Object.keys(obj) : [];
  console.log(`[${idx}] len: ${str.length} | keys: ${keys.slice(0, 6).join(', ')}`);
  if (str.toLowerCase().includes('pink fort') || str.toLowerCase().includes('dandiya') || str.toLowerCase().includes('chkokko') || str.toLowerCase().includes('desi baddie')) {
    console.log(`   MATCH FOUND in [${idx}]!`);
    // Find matching keys
    keys.forEach(k => {
      const kStr = JSON.stringify(obj[k]);
      if (kStr.toLowerCase().includes('pink fort') || kStr.toLowerCase().includes('dandiya') || kStr.toLowerCase().includes('chkokko')) {
        console.log(`     -> key "${k}" has match! len: ${kStr.length}`);
      }
    });
  }
});
