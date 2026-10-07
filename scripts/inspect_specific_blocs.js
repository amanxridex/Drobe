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

const check = ['banner_1923_hp_men', 'coupon_carousel', 'banner_2242_hp_men'];
for (const id of check) {
  console.log(`\n=== Checking ${id} ===`);
  const b = findBloc(id);
  if (b) {
    console.log(JSON.stringify(b, null, 2));
  } else {
    console.log('Not found');
  }
}
