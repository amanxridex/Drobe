const fs = require('fs');
const path = require('path');

// Let's inspect the files in mapping
const mapping = JSON.parse(fs.readFileSync('scripts/women_downloaded_mapping.json', 'utf8'));

// Check which ones are w-375.0 (the lookbook card size!)
const lookbookCards = mapping.filter(m => m.url.includes('w-375.0'));
console.log('Total w-375.0 lookbook candidates:', lookbookCards.length);
lookbookCards.forEach(c => {
  console.log(`[${c.index}] file: ${c.filename} | url: ${c.url}`);
});
