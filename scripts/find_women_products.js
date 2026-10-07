const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_women_full.json', 'utf8'));

const womenProds = [];
const seen = new Set();

data.forEach((obj) => {
  if (!obj || !obj.component_data) return;
  const c = obj.component_data;
  Object.keys(c).forEach(k => {
    const item = c[k];
    if (item && item.bloc_id && item.bloc_id.startsWith('style_color_list_view_')) {
      const id = String(item.id);
      if (seen.has(id)) return;
      
      const brand = item.selected_brand || '';
      const title = item.selected_variant_title || '';
      const cat = item.selected_variant_category || '';
      const subCat = item.selected_variant_sub_category || '';
      const sp = item.select_sp_float || item.selected_variant_sp || 999;
      const mrp = item.selected_variant_mrp || Math.round(sp * 1.35);
      const discount = item.discount_percentage || Math.round(((mrp - sp) / mrp) * 100);
      const images = (item.current_media || []).map(m => m.media_url ? (m.media_url.l || m.media_url.d || m.media_url) : null).filter(Boolean);
      
      const str = (title + ' ' + brand + ' ' + cat + ' ' + subCat).toLowerCase();
      
      // Is women product?
      const isExplicitMen = str.includes("men's") || str.includes("men ") || str.includes("for men");
      const isWomen = (
        !isExplicitMen && (
          str.includes('women') ||
          str.includes('dress') ||
          str.includes('kurti') ||
          str.includes('saree') ||
          str.includes('anarkali') ||
          str.includes('lehenga') ||
          str.includes('top wear') && (brand.toLowerCase().includes('vasavi') || brand.toLowerCase().includes('sassafras') || brand.toLowerCase().includes('truebrowns') || brand.toLowerCase().includes('pink fort') || brand.toLowerCase().includes('chkokko')) ||
          str.includes('bottom wear') && (brand.toLowerCase().includes('vasavi') || brand.toLowerCase().includes('sassafras') || brand.toLowerCase().includes('truebrowns')) ||
          str.includes('ethnic') && (brand.toLowerCase().includes('vasavi') || brand.toLowerCase().includes('kalki') || brand.toLowerCase().includes('divena') || brand.toLowerCase().includes('vastramay')) ||
          brand.toLowerCase().includes('vasavi') ||
          brand.toLowerCase().includes('sassafras') ||
          brand.toLowerCase().includes('truebrowns') ||
          brand.toLowerCase().includes('chumbak') ||
          brand.toLowerCase().includes('kalki') ||
          brand.toLowerCase().includes('pink fort')
        )
      );

      if (isWomen) {
        seen.add(id);
        womenProds.push({
          id,
          brand,
          title,
          category: cat,
          subCategory: subCat,
          price: sp,
          originalPrice: mrp,
          discountPercentage: discount,
          images,
          thumbnail: images[0] || ''
        });
      }
    }
  });
});

console.log(`Found ${womenProds.length} real WOMEN products from Knot!`);
womenProds.forEach((p, idx) => {
  console.log(`[${idx}] ${p.id} | ${p.brand} | ${p.title} | ₹${p.price} | imgs: ${p.images.length}`);
});

fs.writeFileSync('scripts/real_knot_women_products.json', JSON.stringify(womenProds, null, 2));
