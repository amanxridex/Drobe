const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);
const entry11 = data[11];
const hpMen = entry11.component_data['0'];

console.log('coupon_carousel count:', hpMen.coupon_carousel.length);
hpMen.coupon_carousel.slice(0, 3).forEach((item, i) => {
  console.log(`[${i}] alt:`, item.image_url.alt, 'url:', item.image_url.media_url?.l || item.image_url.media_url?.d);
});
