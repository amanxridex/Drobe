const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_test.json', 'utf8'));

console.log('Searching all intercepted objects for women sections/brands...');
data.forEach((obj, idx) => {
  const str = JSON.stringify(obj);
  if (str.includes('hp_women') || str.includes('Women') || str.includes('women')) {
    console.log(`\n--- Object [${idx}] ---`);
    if (obj.component_data) {
      console.log('component_data keys:', Object.keys(obj.component_data));
      if (obj.component_data.sections) {
        console.log('sections:', obj.component_data.sections.length);
        obj.component_data.sections.forEach((s, sIdx) => {
          console.log(`  s[${sIdx}]: ${s.title || s.type || s.id}`);
        });
      }
    }
    if (obj.layout) {
      console.log('layout:', obj.layout);
    }
  }
});
