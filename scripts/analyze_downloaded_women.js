const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('public/assets/real/women');
console.log('Total files downloaded in public/assets/real/women:', files.length);

const categories = files.filter(f => f.includes('Dark_-_Women'));
console.log('\nWomen Categories:');
categories.forEach(f => console.log(' ', f));

const lookbook = files.filter(f => f.includes('586389') || f.includes('861291') || f.includes('825285') || f.includes('640238') || f.includes('101690') || f.includes('864485') || f.includes('988653'));
console.log('\nLookbook banners (w-311):');
lookbook.forEach(f => console.log(' ', f));

const brands = files.filter(f => f.includes('_20261003-'));
console.log('\nBrand logos (w-77): count =', brands.length);
brands.slice(0, 10).forEach(f => console.log(' ', f));

const bigBanners = files.filter(f => f.includes('w-375') || f.includes('128605') || f.includes('565162') || f.includes('254367') || f.includes('348589') || f.includes('207254') || f.includes('100485') || f.includes('181395') || f.includes('100043') || f.includes('813442') || f.includes('839970'));
console.log('\nBig banners / strips count =', bigBanners.length);
bigBanners.forEach(f => console.log(' ', f));
