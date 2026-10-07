const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);

function findBloc(blocId) {
  for (const entry of data) {
    if (entry && entry.component_data) {
      for (const k of Object.keys(entry.component_data)) {
        const obj = entry.component_data[k];
        if (obj && (obj.bloc_id === blocId || obj.id === blocId)) {
          return obj;
        }
      }
    }
  }
  return null;
}

['grid_858', 'row_861', 'grid_1643'].forEach(id => {
  const b = findBloc(id);
  console.log(`\n=== ${id} (${b?.heading}) ===`);
  if (b && b.items) {
    b.items.forEach((item, idx) => {
      const url = item.image_media?.media_url?.l || item.image_media?.media_url?.d;
      const alt = item.image_media?.alt || item.text || item.deeplink;
      console.log(`  [${idx}] alt: ${alt}, url: ${url}, deeplink: ${item.deeplink}`);
    });
  }
});
