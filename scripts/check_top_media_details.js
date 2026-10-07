const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);
const entry11 = data[11];
const hpMen = entry11.component_data['0'];

console.log('iconic_header_cards:', JSON.stringify(hpMen.iconic_header_cards, null, 2));
console.log('top_media:', JSON.stringify(hpMen.top_media, null, 2));
