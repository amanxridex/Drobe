const fs = require('fs');

const prods = JSON.parse(fs.readFileSync('scripts/extracted_real_products.json', 'utf8'));

const womenKeywords = ['dress', 'kurti', 'saree', 'anarkali', 'lehenga', 'suit set', 'earring', 'necklace', 'corset', 'skirt', 'women', 'top wear', 'crop top', 'bra', 'bamboo'];
const womenBrands = ['vasavi', 'sassafras', 'truebrowns', 'chumbak', 'kalki', 'pink fort', 'mywishbag', 'divena', 'tequila', 'tilt'];

let womenCount = 0;
let menCount = 0;

const classified = prods.map(p => {
  const pStr = (p.title + ' ' + p.brand + ' ' + p.category + ' ' + p.subCategory).toLowerCase();
  let isWomen = false;
  if (womenBrands.some(b => p.brand.toLowerCase().includes(b))) {
    isWomen = true;
  } else if (womenKeywords.some(w => pStr.includes(w))) {
    isWomen = true;
  }
  
  if (isWomen) {
    womenCount++;
    return { ...p, gender: 'women' };
  } else {
    menCount++;
    return { ...p, gender: 'men' };
  }
});

console.log(`Classified: ${menCount} Men products, ${womenCount} Women products.`);

console.log('\nSample Women Products:');
classified.filter(p => p.gender === 'women').slice(0, 10).forEach(p => {
  console.log(`  [${p.id}] ${p.brand} - ${p.title} (${p.category} / ${p.subCategory}) - ₹${p.price}`);
});

fs.writeFileSync('scripts/classified_products.json', JSON.stringify(classified, null, 2));
