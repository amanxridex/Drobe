const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/live_knot_men_intercepted_api.json', 'utf8'));
const item14 = data[14];
console.log('URL:', item14.url);
const parsed = JSON.parse(item14.text);
console.log('parsed isArray:', Array.isArray(parsed), 'type:', typeof parsed);
if (Array.isArray(parsed)) {
  console.log('parsed length:', parsed.length);
  // print first 20 items
  for (let i = 0; i < Math.min(20, parsed.length); i++) {
    console.log(`[${i}]`, parsed[i]);
  }
} else {
  console.log('Sample string/slice:', String(parsed).slice(0, 500));
}
