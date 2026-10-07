const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_women_full.json', 'utf8'));

[26, 28, 32, 34, 45, 46, 48].forEach((idx) => {
  const obj = data[idx];
  console.log(`\n================ OBJ [${idx}] ================`);
  const cData = obj.component_data;
  if (!cData) return;
  
  Object.keys(cData).forEach(k => {
    const item = cData[k];
    const s = JSON.stringify(item);
    if (s.toLowerCase().includes('pink fort') || s.toLowerCase().includes('dandiya') || s.toLowerCase().includes('chkokko') || s.toLowerCase().includes('desi baddie') || s.toLowerCase().includes('vasavi')) {
      console.log(`Key "${k}": bloc_id=${item.bloc_id || item.id} type=${item.type}`);
      if (item.heading) console.log(`  heading: ${item.heading}`);
      if (item.items) console.log(`  items count: ${item.items.length}`);
      if (item.products) console.log(`  products count: ${item.products.length}`);
      if (item.cards) console.log(`  cards count: ${item.cards.length}`);
      // Print first item sample
      console.log('  sample:', s.substring(0, 250));
    }
  });
});
