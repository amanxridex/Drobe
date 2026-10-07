const fs = require('fs');

const intercepted = JSON.parse(fs.readFileSync('scripts/intercepted_test.json', 'utf8'));

[9, 11, 20, 21, 23].forEach((idx) => {
  const item = intercepted[idx];
  console.log(`\n================ ENTRY ${idx} ================`);
  console.log('Type:', typeof item, Array.isArray(item) ? 'Array' : 'Object');
  if (item && typeof item === 'object') {
    console.log('Keys:', Object.keys(item));
    if (item.sections) {
      console.log('Sections count:', item.sections.length);
      item.sections.forEach((sec, sIdx) => {
        console.log(`  Sec [${sIdx}]: type=${sec.type || sec.widget_type} title=${sec.title || sec.heading || sec.name}`);
        if (sec.items) console.log(`    items: ${sec.items.length}`);
        if (sec.products) console.log(`    products: ${sec.products.length}`);
      });
    }
    if (item.data) {
      console.log('data keys:', Object.keys(item.data));
    }
    if (item.widgets) {
      console.log('widgets count:', item.widgets.length);
      item.widgets.forEach((w, wIdx) => {
        console.log(`  Widget [${wIdx}]: type=${w.type || w.widget_type} title=${w.title || w.heading || w.name}`);
      });
    }
    if (Array.isArray(item)) {
      console.log('Array len:', item.length);
      console.log('First 2 items:', JSON.stringify(item.slice(0, 2)).substring(0, 300));
    }
  }
});
