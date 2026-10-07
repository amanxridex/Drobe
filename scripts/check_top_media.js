const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);
const entry11 = data[11];
const hpMen = entry11.component_data['0'];

console.log('Top keys related to media / banners:');
for (const k of Object.keys(hpMen)) {
  if (k.startsWith('top_') || k.includes('banner') || k.includes('coupon') || k.includes('header') || k.includes('sale')) {
    const val = hpMen[k];
    console.log(`- ${k}: type=${typeof val}, isArr=${Array.isArray(val)}, len=${val?.length}`);
  }
}
