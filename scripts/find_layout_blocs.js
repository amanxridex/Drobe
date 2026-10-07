const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);

const entry11 = data[11];
console.log('Entry 11 keys:', Object.keys(entry11));
const cd = entry11.component_data;
console.log('component_data keys count:', Object.keys(cd).length);

// Let's check the hp_men bloc in cd
for (const k of Object.keys(cd)) {
  const obj = cd[k];
  if (obj && (obj.bloc_id === 'hp_men' || obj.id === 'hp_men' || k === 'hp_men' || k === '0')) {
    console.log(`Key ${k}: bloc_id=${obj.bloc_id}`);
    console.log('Keys in obj:', Object.keys(obj));
    if (obj.blocs || obj.bloc_ids || obj.children || obj.widgets || obj.layout) {
      const bList = obj.blocs || obj.bloc_ids || obj.children || obj.widgets || obj.layout;
      console.log('Found bloc list of length:', bList.length);
      console.log(JSON.stringify(bList, null, 2));
    }
  }
}
