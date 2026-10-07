const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'intercepted_test.json'), 'utf8'));
const item11 = raw[11];

// Human-friendly title mapping derived from authentic deeplinks
const TITLE_MAP = {
  '1429': 'Classic Black',
  '2966': 'SNITCH',
  '2988': 'The Indian Garage Co',
  '1431': 'Comfort Hoodie',
  '1435': 'Home & Lifestyle',
  '1433': 'Footwear',
  '1434': 'Denims',
  '1432': 'Trends: Techno Party Fits',
  '1440': 'Office Wear',
  '1439': 'Pants & Trousers',
  '1438': 'Jackets',
  '1437': 'T-Shirts',
  '1444': 'Shirts',
  '1443': 'Co-ords',
  '1442': 'Joggers',
  '1441': 'Cocktail Hour Fits',
  '1448': 'Street Cred',
  '1447': 'Socks',
  '1446': 'Sundowner Party Edit',
  '1445': 'After Hours',
  '1451': '90s Edit',
  '1452': 'Oversized Energy',
  '1450': 'Polo T-Shirts',
  '1449': 'Innerwear',
  '1456': 'Festive PM OOTD',
  '1457': 'Festive AM OOTD',
  '1453': 'Just Vibing',
  '1455': 'Beach Wear',
  '1458': 'Brunch Bloom'
};

const curatedSections = [];
const allExtractedProducts = [];

for (let i = 14; i <= 42; i++) {
  const item = raw[i];
  if (!item?.component_data) continue;
  const rowComp = item.component_data.find(c => c.bloc_id?.startsWith('product_row'));
  if (!rowComp) continue;

  const c11 = item11?.component_data?.find(c => c.bloc_id === rowComp.bloc_id);
  const deeplink = rowComp.on_click_action?.params?.deeplink || c11?.on_click_action?.params?.deeplink || c11?.items?.[1]?.deeplink || '';
  const id = String(rowComp.id);
  const title = TITLE_MAP[id] || (deeplink ? deeplink.split('/').pop().replace(/-/g, ' ').toUpperCase() : `Collection ${id}`);

  const hasBg = fs.existsSync(path.join(__dirname, '..', 'public', 'assets', 'real', 'section_bgs', `bg_sec_${id}.webp`));
  const bgImage = hasBg ? `/assets/real/section_bgs/bg_sec_${id}.webp` : null;

  const rawProds = item.component_data.filter(c => c.bloc_id?.startsWith('style_color_list_view_'));
  const products = [];

  for (const p of rawProds) {
    if (!p.id || !p.selected_variant_title) continue;

    // Parse numeric prices
    const parsePrice = (str) => {
      if (!str) return 0;
      const clean = String(str).replace(/[^0-9]/g, '');
      return parseInt(clean, 10) || 0;
    };

    const sp = p.selected_variant_sp || '';
    const mrp = p.selected_variant_mrp || '';
    const priceNum = parsePrice(sp);
    const mrpNum = parsePrice(mrp);

    // Media list
    const mediaUrls = (p.current_media || []).map(m => m.media_url?.l || m.media_url?.d).filter(Boolean);
    const thumbnail = mediaUrls[0] || '';

    // Tag badge (e.g., EXTRA ₹999 OFF)
    const tagUrl = p.tag?.expanded?.media_url?.d || p.tag?.expanded?.media_url?.l || null;

    const prodObj = {
      id: String(p.id),
      brand: p.selected_brand || 'KNOT',
      title: p.selected_variant_title,
      price: priceNum,
      originalPrice: mrpNum > priceNum ? mrpNum : priceNum,
      priceFormatted: sp,
      mrpFormatted: mrp,
      discountPercentage: p.discount_percentage || (mrpNum > priceNum ? `${Math.round(((mrpNum - priceNum) / mrpNum) * 100)}% off` : ''),
      bestPrice: p.best_price || '',
      bestPriceText: p.best_price_text || 'Best Price ',
      withCouponText: p.with_coupon_text || ' with coupon',
      deliveryText: p.delivery_tier_text || '60 mins delivery',
      images: mediaUrls.length > 0 ? mediaUrls : [thumbnail],
      thumbnail: thumbnail,
      tag: tagUrl,
      gender: 'men',
      category: p.selected_variant_category || 'fashion',
      subCategory: p.selected_variant_sub_category || '',
      sizes: (p.current_sizes || []).map(s => s.size_name).filter(Boolean),
      description: (p.current_tabs_data || []).find(t => t.type === 'description')?.value || '',
      rating: p.rating || 4.5,
      ratingCount: p.rating_count || 120,
      tryAndBuyEligible: true,
      inStock: true
    };

    products.push(prodObj);
    allExtractedProducts.push(prodObj);
  }

  curatedSections.push({
    id: id,
    bloc_id: rowComp.bloc_id,
    title: title,
    deeplink: deeplink,
    bgImage: bgImage,
    hasBg: !!bgImage,
    topPadding: bgImage ? 120 : 16,
    bottomPadding: 16,
    productsCount: products.length,
    products: products
  });
}

const outPath = path.join(__dirname, '..', 'data', 'men_curated_sections.json');
fs.writeFileSync(outPath, JSON.stringify(curatedSections, null, 2), 'utf8');

console.log(`Successfully compiled ${curatedSections.length} Men Curated Sections with ${allExtractedProducts.length} total products to data/men_curated_sections.json!`);

// Print summary
curatedSections.forEach((s, idx) => {
  console.log(`[${idx + 1}] ID: ${s.id} | Title: "${s.title}" | BG: ${s.hasBg ? 'YES' : 'NO'} | Products: ${s.productsCount} | Sample: ${s.products[0]?.brand} - ${s.products[0]?.title.substring(0, 25)}`);
});
