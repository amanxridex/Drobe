const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);
const entry11 = data[11];
const hpMen = entry11.component_data['0'];

console.log('coupon_carousel in hpMen:', hpMen.coupon_carousel);
console.log('iconic_header_cards:', hpMen.iconic_header_cards);
console.log('product_carousel:', hpMen.product_carousel);
