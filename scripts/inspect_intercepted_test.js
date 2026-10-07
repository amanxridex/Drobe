const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);
console.log('Is array:', Array.isArray(data), 'length:', data.length);

data.forEach((item, idx) => {
  if (typeof item === 'object' && item !== null) {
    const keys = Object.keys(item);
    console.log(`\n--- Item ${idx} ---`);
    console.log('Keys:', keys.slice(0, 10));
    if (item.type) console.log('type:', item.type);
    if (item.id) console.log('id:', item.id);
    if (item.heading) console.log('heading:', item.heading);
    if (item.title) console.log('title:', item.title);
    if (item.data) {
      if (Array.isArray(item.data)) {
        console.log('data is array of length:', item.data.length);
        if (item.data.length > 0 && typeof item.data[0] === 'object') {
          console.log('data[0] keys:', Object.keys(item.data[0]).slice(0, 8));
          console.log('data[0] sample:', item.data[0].title || item.data[0].name || item.data[0].id || item.data[0].type);
        }
      } else {
        console.log('data is object, keys:', Object.keys(item.data).slice(0, 10));
      }
    }
  }
});
