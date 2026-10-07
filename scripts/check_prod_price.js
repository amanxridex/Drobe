const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_women_full.json', 'utf8'));

data.forEach((obj) => {
  if (obj && obj.component_data && obj.component_data['24']) {
    const item = obj.component_data['24'];
    if (item.id === 31900 || item.id === '31900') {
      console.log('Found 31900:');
      console.log('select_sp_float:', item.select_sp_float);
      console.log('selected_variant_sp:', item.selected_variant_sp);
      console.log('selected_variant_mrp:', item.selected_variant_mrp);
      console.log('discount_percentage:', item.discount_percentage);
      console.log('current_measure:', item.current_measure);
      console.log('keys:', Object.keys(item));
    }
  }
});
