const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'intercepted_test.json'), 'utf8'));

console.log('Total items in intercepted_test.json:', data.length);

const sections = [];

for (let i = 0; i < data.length; i++) {
  const item = data[i];
  if (!item || !item.component_data) continue;
  const rowComp = item.component_data.find(c => c.bloc_id?.startsWith('product_row'));
  const prods = item.component_data.filter(c => c.bloc_id?.startsWith('style_color_list_view_'));
  
  if (rowComp) {
    const bg = rowComp.background_media?.media_url?.l || rowComp.background_media?.media_url?.d || rowComp.background_media?.url || (typeof rowComp.background_media === 'string' ? rowComp.background_media : null);
    const brands = [...new Set(prods.map(p => p.selected_brand).filter(Boolean))];
    const cat = prods[0]?.selected_variant_category || '';
    const sampleTitle = prods[0]?.selected_variant_title || '';
    
    sections.push({
      index: i,
      id: rowComp.id,
      bloc_id: rowComp.bloc_id,
      bgUrl: bg,
      prodCount: prods.length,
      brands: brands,
      category: cat,
      sampleTitle: sampleTitle
    });
  }
}

console.log('Found', sections.length, 'sections with product_row');
sections.forEach(s => {
  console.log(`[${s.index}] ID: ${s.id} | BG: ${s.bgUrl ? 'YES' : 'NO '} | Prods: ${s.prodCount} | Brands: ${s.brands.slice(0, 3).join(', ')} | Cat: ${s.category} | Sample: ${s.sampleTitle.substring(0, 30)}`);
  if (s.bgUrl) {
    console.log(`     BG: ${s.bgUrl}`);
  }
});
