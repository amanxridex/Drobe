const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'intercepted_test.json'), 'utf8'));
const item11 = data[11];

console.log('=== row_2547 ===');
const row2547 = item11?.component_data?.find(c => c.bloc_id === 'row_2547');
row2547?.items?.forEach((it, i) => {
  console.log(`[${i}] alt: "${it.image_media?.alt}" url: "${it.image_media?.media_url?.l}" deeplink: "${it.deeplink}"`);
});

console.log('\n=== grid_2882 ===');
const g2882 = item11?.component_data?.find(c => c.bloc_id === 'grid_2882');
g2882?.items?.forEach((it, i) => {
  console.log(`[${i}] alt: "${it.image_media?.alt || it.text}" deeplink: "${it.deeplink}" url: "${it.image_media?.media_url?.l}"`);
});
