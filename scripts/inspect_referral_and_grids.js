const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'intercepted_test.json'), 'utf8'));
const item11 = data[11];

console.log('--- Inspecting row_2547 ---');
const row2547 = item11?.component_data?.find(c => c.bloc_id === 'row_2547');
if (row2547) {
  console.log('row_2547 items count:', row2547.items?.length);
  row2547.items?.forEach((it, i) => {
    const url = it.image_media?.media_url?.l || it.image_media?.media_url?.d;
    const alt = it.image_media?.alt || '';
    console.log(`Item ${i}: alt="${alt}" url="${url}" deeplink="${it.deeplink}"`);
  });
}

console.log('--- Inspecting grids 2882-2886 ---');
['grid_2882', 'grid_2883', 'grid_2884', 'grid_2885', 'grid_2886'].forEach(id => {
  const g = item11?.component_data?.find(c => c.bloc_id === id);
  if (g) {
    console.log(`\n=== ${id} === items count: ${g.items?.length}`);
    g.items?.forEach((it, i) => {
      const url = it.image_media?.media_url?.l || it.image_media?.media_url?.d;
      const alt = it.image_media?.alt || it.text || '';
      console.log(`  [${i}] alt="${alt}" deeplink="${it.deeplink}" url="${url}"`);
    });
  } else {
    console.log(`${id} NOT found directly`);
  }
});
