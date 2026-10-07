const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_test.json', 'utf8'));

[20, 21, 23, 31, 35, 40].forEach((idx) => {
  const obj = data[idx];
  if (obj && obj.component_data && obj.component_data['0']) {
    const s0 = obj.component_data['0'];
    console.log(`\n=== Object ${idx} Section 0 ===`);
    console.log(JSON.stringify(s0).substring(0, 300));
  }
});
