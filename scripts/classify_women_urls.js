const fs = require('fs');

const allUrls = JSON.parse(fs.readFileSync('scripts/knot_women_all_urls.json', 'utf8'));

console.log('--- ALL URLs in knot_women_all_urls.json ---');
const categories = [];
const banners = [];
const brands = [];
const products = [];
const other = [];

allUrls.forEach((u) => {
  if (u.includes('frkn_Dark%20-%20Women') || u.includes('Women')) {
    categories.push(u);
  } else if (u.includes('w-77.0') || u.includes('w-77')) {
    brands.push(u);
  } else if (u.includes('w-375.0') || u.includes('w-375') || u.includes('w-343') || u.includes('w-311.0')) {
    banners.push(u);
  } else if (u.includes('/brand/') || u.includes('/catalog_ingestion/')) {
    products.push(u);
  } else {
    other.push(u);
  }
});

console.log(`Categories (${categories.length}):`);
categories.forEach(u => console.log(' ', u));

console.log(`\nBrands (${brands.length}):`);
brands.forEach(u => console.log(' ', u));

console.log(`\nBanners / Lookbook / Rails (${banners.length}):`);
banners.forEach(u => console.log(' ', u));

console.log(`\nProducts (${products.length}):`);
products.forEach(u => console.log(' ', u));

console.log(`\nOther (${other.length}):`);
other.forEach(u => console.log(' ', u));
