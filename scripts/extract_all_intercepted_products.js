const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/intercepted_women_full.json', 'utf8'));

const allProducts = new Map();

data.forEach((obj, objIdx) => {
  if (!obj || !obj.component_data) return;
  const cData = obj.component_data;
  Object.keys(cData).forEach(k => {
    const item = cData[k];
    if (item && item.bloc_id && item.bloc_id.startsWith('style_color_list_view_')) {
      const pid = String(item.id);
      if (!allProducts.has(pid)) {
        const brand = item.selected_brand || 'KNOT';
        const title = item.selected_variant_title || '';
        const sp = item.selected_variant_sp || item.select_sp_float || 999;
        const mrp = item.selected_variant_mrp || Math.round(sp * 1.35);
        const discount = item.discount_percentage || 0;
        const cat = item.selected_variant_category || '';
        const subCat = item.selected_variant_sub_category || '';
        const images = (item.current_media || []).map(m => m.media_url ? (m.media_url.l || m.media_url.d || m.media_url) : null).filter(Boolean);
        const rating = item.rating || 4.8;
        const ratingCount = item.rating_count || 120;
        
        allProducts.set(pid, {
          id: pid,
          brand,
          title,
          price: Number(sp),
          originalPrice: Number(mrp),
          discountPercentage: Number(discount),
          category: cat,
          subCategory: subCat,
          images,
          thumbnail: images[0] || '',
          rating: Number(rating),
          reviewsCount: Number(ratingCount),
          tryAndBuyEligible: !item.try_and_buy_not_available
        });
      }
    }
  });
});

console.log(`Extracted ${allProducts.size} unique style_color_list_view products!`);

const prodArray = Array.from(allProducts.values());
const brands = [...new Set(prodArray.map(p => p.brand))];
console.log('Brands found:', brands);

fs.writeFileSync('scripts/extracted_real_products.json', JSON.stringify(prodArray, null, 2));
console.log('Saved scripts/extracted_real_products.json');
