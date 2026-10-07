const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_women_full.json', 'utf8'));

const prod = data[26].component_data['24'];
console.log('Keys of product 32497:', Object.keys(prod));
console.log('Sample product properties:');
['id', 'brand_name', 'name', 'title', 'price', 'mrp', 'selling_price', 'discount', 'images', 'specs', 'category', 'sub_category', 'gender'].forEach(k => {
  console.log(`  ${k}:`, prod[k]);
});
console.log('Full JSON sample (1000 chars):', JSON.stringify(prod).substring(0, 1000));
