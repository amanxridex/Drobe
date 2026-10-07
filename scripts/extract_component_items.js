const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);

data.forEach((entry, eIdx) => {
  if (entry && entry.component_data) {
    const cd = entry.component_data;
    const keys = Object.keys(cd);
    keys.forEach((k) => {
      const obj = cd[k];
      if (obj && typeof obj === 'object') {
        const blocId = obj.bloc_id || obj.id;
        const heading = obj.heading || obj.title || obj.name;
        const keysInObj = Object.keys(obj);
        const hasProducts = !!(obj.products || obj.product_ids || obj.items);
        console.log(`[Entry ${eIdx} | k=${k}] bloc_id=${blocId}, heading=${heading}, products=${hasProducts}, keys=[${keysInObj.slice(0, 8).join(', ')}]`);
      }
    });
  }
});
