const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_test.json', 'utf8'));

const obj = data[11];
console.log('Object 11 component_data count:', Object.keys(obj.component_data).length);

Object.entries(obj.component_data).slice(0, 30).forEach(([key, val]) => {
  const vStr = JSON.stringify(val);
  const title = val.title || val.heading || val.name || (val.data && (val.data.title || val.data.heading)) || '';
  const type = val.type || val.widget_type || val.component_type || '';
  console.log(`[Section ${key}] type: ${type} | title: ${title} | len: ${vStr.length}`);
  if (vStr.toLowerCase().includes('brand') || vStr.toLowerCase().includes('women')) {
    console.log(`  Preview: ${vStr.substring(0, 150)}`);
  }
});
