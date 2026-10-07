const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'intercepted_test.json'), 'utf8'));
const item11 = data[11];

for (let i = 14; i <= 42; i++) {
  const item = data[i];
  if (!item || !item.component_data) continue;
  const rowComp = item.component_data.find(c => c.bloc_id?.startsWith('product_row'));
  if (!rowComp) continue;
  
  const c11 = item11?.component_data?.find(c => c.bloc_id === rowComp.bloc_id);
  const deeplink = rowComp.deeplink || c11?.deeplink || c11?.items?.[0]?.deeplink;
  const heading = rowComp.heading || c11?.heading;
  const prods = item.component_data.filter(c => c.bloc_id?.startsWith('style_color_list_view_'));
  const brands = [...new Set(prods.map(p => p.selected_brand).filter(Boolean))];
  
  console.log(`[${i}] ID: ${rowComp.id} | bloc: ${rowComp.bloc_id} | heading: ${JSON.stringify(heading)} | deeplink: ${deeplink} | brands: ${brands.slice(0, 3).join(', ')}`);
}
