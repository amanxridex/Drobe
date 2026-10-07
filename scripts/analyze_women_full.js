const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_women_full.json', 'utf8'));

console.log('Total objects intercepted:', data.length);

data.forEach((obj, idx) => {
  if (obj && obj.component_data) {
    const s0 = obj.component_data['0'];
    const s0Str = s0 ? (s0.bloc_id || s0.id || '') : '';
    console.log(`[${idx}] component_data keys: ${Object.keys(obj.component_data).length} | s0: ${s0Str}`);
  }
});
