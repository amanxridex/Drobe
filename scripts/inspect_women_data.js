const fs = require('fs');

console.log('--- Inspecting hp_women_clean.json ---');
if (fs.existsSync('scripts/hp_women_clean.json')) {
  const hp = JSON.parse(fs.readFileSync('scripts/hp_women_clean.json', 'utf8'));
  console.log('hp keys:', Object.keys(hp));
  // check structure
  const sampleStr = JSON.stringify(hp).substring(0, 500);
  console.log('sample:', sampleStr);
}

console.log('--- Inspecting real_women_api.json ---');
if (fs.existsSync('scripts/real_women_api.json')) {
  const data = JSON.parse(fs.readFileSync('scripts/real_women_api.json', 'utf8'));
  console.log('Is array:', Array.isArray(data));
  if (Array.isArray(data)) {
    console.log('Length:', data.length);
    data.slice(0, 5).forEach((item, idx) => {
      console.log(`[${idx}]`, Object.keys(item));
      if (item.url) console.log('  url:', item.url);
      if (item.data) {
        console.log('  data keys:', typeof item.data === 'object' ? Object.keys(item.data) : typeof item.data);
      }
    });
  } else {
    console.log('Keys:', Object.keys(data));
  }
}
