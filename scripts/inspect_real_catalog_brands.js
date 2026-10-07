const fs = require('fs');

const prods = JSON.parse(fs.readFileSync('data/real_catalog.json', 'utf8'));
console.log('Total real_catalog prods:', prods.length);

// Let's inspect brands and categories in real_catalog
const brands = {};
const cats = {};
prods.forEach(p => {
  brands[p.brand] = (brands[p.brand] || 0) + 1;
  cats[p.category] = (cats[p.category] || 0) + 1;
});
console.log('Brands:', brands);
console.log('Categories:', cats);
