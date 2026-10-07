const fs = require('fs');

const rawProds = JSON.parse(fs.readFileSync('data/real_catalog.json', 'utf8'));

// Determine gender properly:
// Brands that are inherently Women:
const womenBrands = new Set([
  'Chumbak', 'trueBrowns', 'GIVA', 'Cava Athleisure', 'Dalchinii', 'PEACH', 
  'THE CLOTHING FACTORY', 'Vasavi', 'Sassafras', 'KALKI', 'Pink Fort', 'MyWishBag', 'Divena', 'Tequila', 'Tilt'
]);

// Brands that are inherently Men:
const menBrands = new Set([
  'SNITCH', 'The Indian Garage Co', 'The Bear House', 'Thomas Scott', 'Powerlook',
  'Javinishka', 'Manyavar', 'TASVA', 'Banana Club', 'OneMile', 'BLUE TYGA', 'Smokeshow',
  'The Kurta Studio', 'Hancock', 'Bene Kleed'
]);

// Shared/Unisex brands that have both:
// 'The Souled Store', 'Bewakoof', 'CHKOKKO', 'CHUPPS', 'Hexafun', 'Underrated club', 'Veirdo', etc.

let womenList = [];
let menList = [];

rawProds.forEach((p, idx) => {
  const brand = p.brand || '';
  const title = (p.title || '').toLowerCase();
  const cat = (p.category || '').toLowerCase();
  const sub = (p.sub_category || '').toLowerCase();
  const text = `${title} ${cat} ${sub}`;

  let isWomen = false;
  if (womenBrands.has(brand)) {
    isWomen = true;
  } else if (menBrands.has(brand)) {
    isWomen = false;
  } else if (text.includes("women") || text.includes("dress") || text.includes("kurti") || text.includes("saree") || text.includes("earring") || text.includes("necklace") || text.includes("crop top") || text.includes("skirt")) {
    isWomen = true;
  } else if (text.includes("men's") || text.includes("men ")) {
    isWomen = false;
  } else {
    // For unisex brands (e.g. The Souled Store, Chkokko, Chupps, Hexafun, Underrated club):
    // Distribute evenly so both categories have a rich catalog!
    if (idx % 3 === 0) {
      isWomen = true;
    } else {
      isWomen = false;
    }
  }

  if (isWomen) {
    womenList.push(p);
  } else {
    menList.push(p);
  }
});

console.log(`Classified: ${menList.length} Men products, ${womenList.length} Women products.`);
