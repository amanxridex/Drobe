const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_test.json', 'utf8'));

function findKeys(obj, query, path = '') {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => findKeys(item, query, `${path}[${i}]`));
  } else {
    for (const [k, v] of Object.entries(obj)) {
      if (k.toLowerCase().includes(query.toLowerCase())) {
        console.log(`Found: ${path}.${k} =>`, typeof v === 'object' ? (Array.isArray(v) ? `Array[${v.length}]` : 'Object') : v);
        if (typeof v === 'object') {
          console.log('Value sample:', JSON.stringify(v, null, 2).slice(0, 500));
        }
      }
      findKeys(v, query, `${path}.${k}`);
    }
  }
}

findKeys(data, 'search');
