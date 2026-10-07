const fs = require('fs');

const intercepted = JSON.parse(fs.readFileSync('scripts/intercepted_test.json', 'utf8'));
console.log('Total entries:', intercepted.length);
let womenCount = 0;
intercepted.forEach((item, idx) => {
  const str = JSON.stringify(item);
  if (str.toLowerCase().includes('women')) {
    womenCount++;
    console.log(`Entry ${idx} has women! length: ${str.length}`);
  }
});
console.log('Entries mentioning women:', womenCount);
