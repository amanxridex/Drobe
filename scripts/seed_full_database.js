const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eswnhehlnzasiaybjikh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzd25oZWhsbnphc2lheWJqaWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5Njc4MDUsImV4cCI6MjEwNzU0MzgwNX0.9aw2R0ZtRC9Cv-9j05GgrNd0PcnxaTbyw7uf-2x7l0M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to normalize brand slug
function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function seed() {
  console.log('--- Starting Full Database Seeding ---');

  // 1. Load data
  const catalogPath = path.join(__dirname, '..', 'data', 'catalog.ts');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');
  
  // Extract catalog via evaluation
  const { PRODUCTS, CATEGORIES_DATA } = require('../data/catalog.ts');
  const discoverBrandsData = require('../data/discover_brands_manifest.json');
  const categoriesGridData = require('../data/categories_grid_manifest.json');

  console.log(`Loaded ${PRODUCTS.length} products, categories, and discover brands.`);

  // 2. SEED CATEGORIES
  console.log('Seeding drobe_categories...');
  const categoriesToInsert = [];

  // Men main categories
  CATEGORIES_DATA.men.forEach((c, idx) => {
    categoriesToInsert.push({
      id: c.id,
      name: c.name,
      gender: 'men',
      icon: c.icon,
      image: c.image,
      route: `/collection/${c.id}`,
      sort_order: idx + 1,
      is_active: true
    });
  });

  // Women main categories
  CATEGORIES_DATA.women.forEach((c, idx) => {
    categoriesToInsert.push({
      id: c.id,
      name: c.name,
      gender: 'women',
      icon: c.icon,
      image: c.image,
      route: `/collection/${c.id}`,
      sort_order: idx + 1,
      is_active: true
    });
  });

  // Categories grid manifest
  if (Array.isArray(categoriesGridData)) {
    categoriesGridData.forEach((c, idx) => {
      if (!c.alt) return;
      const id = slugify(c.alt);
      const exists = categoriesToInsert.some(cat => cat.id === id && cat.gender === 'all');
      if (!exists) {
        categoriesToInsert.push({
          id: id,
          name: c.alt,
          gender: 'all',
          icon: null,
          image: c.img,
          route: c.deeplink || `/collection/${id}`,
          sort_order: 100 + idx,
          is_active: true
        });
      }
    });
  }

  for (let i = 0; i < categoriesToInsert.length; i += 25) {
    const batch = categoriesToInsert.slice(i, i + 25);
    const { error } = await supabase.from('drobe_categories').upsert(batch, { onConflict: 'id,gender' });
    if (error) {
      console.warn('Error inserting categories batch:', error.message);
    }
  }
  console.log(`✓ Inserted/Updated ${categoriesToInsert.length} categories.`);

  // 3. SEED BRANDS
  console.log('Seeding drobe_brands...');
  const brandsMap = new Map();

  // First collect discover brands
  if (discoverBrandsData && Array.isArray(discoverBrandsData.slides)) {
    discoverBrandsData.slides.forEach(slide => {
      if (Array.isArray(slide)) {
        slide.forEach(b => {
          if (!b.name) return;
          const slug = slugify(b.name);
          if (!brandsMap.has(slug)) {
            brandsMap.set(slug, {
              id: slug,
              name: b.name,
              tagline: `${b.name} • Contemporary High Fashion`,
              category: 'Modern Apparel',
              founder_name: `${b.name} Studio`,
              founder_role: 'Founder & Creative Director',
              email: `concierge@${slug}.drobe.in`,
              phone: '+91 79 4892 1001',
              based_out_of: 'Ahmedabad Darkstore Hub',
              status: 'Approved',
              profile_image: b.img,
              cover_image: b.img,
              website: `https://${slug}.com`,
              instagram: `@${slug}.official`,
              established_year: '2022',
              about: `${b.name} represents cutting-edge modern aesthetics curated directly for 60-minute express doorstep trial on Drobe.`,
              mission: `Crafting bespoke, contemporary fits delivered to your door in 60 minutes.`,
              values: [
                { title: 'Artisanal Craft', description: 'Superior fabrics and tailored silhouettes.' },
                { title: 'Doorstep Fitting', description: 'Try in 30 to 60 minutes with zero prepay friction.' }
              ],
              bank_account_holder: `${b.name} Private Limited`,
              bank_name: 'HDFC Bank',
              bank_account_number: '5010049281920',
              bank_ifsc: 'HDFC0001842',
              bank_account_type: 'Current',
              bank_is_verified: true,
              total_products_count: 0,
              inwarded_units_count: 50
            });
          }
        });
      }
    });
  }

  // Also extract brands from all products
  PRODUCTS.forEach(p => {
    if (!p.brand) return;
    const slug = slugify(p.brand);
    if (!brandsMap.has(slug)) {
      brandsMap.set(slug, {
        id: slug,
        name: p.brand,
        tagline: `${p.brand} • Designer Collection`,
        category: p.category ? (p.category.charAt(0).toUpperCase() + p.category.slice(1)) : 'Apparel',
        founder_name: `${p.brand} Studio`,
        founder_role: 'Lead Designer & Director',
        email: `concierge@${slug}.drobe.in`,
        phone: '+91 79 4892 1001',
        based_out_of: 'Ahmedabad Darkstore Hub',
        status: 'Approved',
        profile_image: p.thumbnail || (p.images && p.images[0]) || '',
        cover_image: p.thumbnail || (p.images && p.images[0]) || '',
        website: `https://${slug}.com`,
        instagram: `@${slug}`,
        established_year: '2023',
        about: `${p.brand} brings signature silhouettes and premium styling, available for 60-minute doorstep try and buy across Ahmedabad.`,
        mission: `Democratizing luxury fashion with instant delivery and real-world trials.`,
        values: [
          { title: 'Quality First', description: 'Hand-inspected silhouettes made for modern lifestyle.' },
          { title: 'Instant Trial', description: 'Experience the fabric at your door in 60 minutes.' }
        ],
        bank_account_holder: `${p.brand} Studio`,
        bank_name: 'ICICI Bank',
        bank_account_number: '002405018291',
        bank_ifsc: 'ICIC0000024',
        bank_account_type: 'Current',
        bank_is_verified: true,
        total_products_count: 0,
        inwarded_units_count: 30
      });
    }
    // Update product count
    const b = brandsMap.get(slug);
    b.total_products_count += 1;
  });

  const brandsList = Array.from(brandsMap.values());
  for (let i = 0; i < brandsList.length; i += 20) {
    const batch = brandsList.slice(i, i + 20);
    const { error } = await supabase.from('drobe_brands').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.warn('Error inserting brands batch:', error.message);
    }
  }
  console.log(`✓ Inserted/Updated ${brandsList.length} brands in drobe_brands.`);

  // 4. SEED PRODUCTS (433 catalog products)
  console.log('Seeding drobe_products (433 items)...');
  const productsToInsert = PRODUCTS.map((p, idx) => {
    const brandSlug = slugify(p.brand);
    const rackLetter = idx % 3 === 0 ? 'A' : idx % 3 === 1 ? 'B' : 'C';
    const shelfNum = (idx % 4) + 1;
    const binNum = (idx % 16) + 1;
    const binFormatted = binNum < 10 ? `0${binNum}` : `${binNum}`;
    const shelfCode = `AMD-R${rackLetter}01-S${shelfNum}-B${binFormatted}`;

    return {
      id: p.id,
      sku: `DR-${p.id}`,
      sku_serial: idx + 1,
      name: p.title,
      title: p.title,
      brand_id: brandSlug,
      brand_name: p.brand,
      category: p.category,
      sub_category: p.subCategory,
      gender: p.gender,
      price: `₹${p.price}`,
      price_cents: p.price * 100,
      original_price: p.originalPrice,
      discount_percentage: p.discountPercentage,
      volume: (p.sizes && p.sizes[0]) || 'M',
      declared_inventory: 40,
      inward_units: 32,
      units_in_trial: 2,
      units_sold: 6,
      tagline: `${p.brand} • ${p.subCategory || p.category}`,
      description: p.description,
      images: p.images && p.images.length > 0 ? p.images : [p.thumbnail],
      thumbnail: p.thumbnail || (p.images && p.images[0]) || '',
      fabric: p.fabric || 'Premium Blend',
      fit: p.fit || 'Modern Regular Fit',
      rating: p.rating || 4.8,
      reviews_count: p.reviewsCount || 24,
      sizes: p.sizes || ['S', 'M', 'L', 'XL'],
      in_stock: p.inStock ?? true,
      try_and_buy_eligible: p.tryAndBuyEligible ?? true,
      delivery_minutes: p.deliveryMinutes || 60,
      delivery_location: p.deliveryLocation || 'Ahmedabad (60-Min Zone)',
      extra_discount_badge: p.extraDiscountBadge || null,
      promo_tag: p.promoTag || null,
      coupon_promo: p.couponPromo || null,
      inward_status: 'Inwarded & Live',
      is_live: true,
      shelf_code: shelfCode,
      shelf_details: {
        zone: rackLetter === 'A' ? 'Zone A - Outerwear' : rackLetter === 'B' ? 'Zone B - Tops' : 'Zone C - Bottoms',
        rack: `Rack ${rackLetter}-01`,
        shelf: `Shelf ${shelfNum}`,
        bin: `Bin ${binFormatted}`,
        code: shelfCode,
        hubName: 'Drobe Central Darkstore Hub #01 (Koteshwar Road)'
      },
      raw_product_data: p,
      updated_at: new Date().toISOString()
    };
  });

  for (let i = 0; i < productsToInsert.length; i += 25) {
    const batch = productsToInsert.slice(i, i + 25);
    const { error } = await supabase.from('drobe_products').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.warn(`Error inserting products batch ${i} - ${i + batch.length}:`, error.message);
    } else {
      process.stdout.write(`.` );
    }
  }
  console.log(`\n✓ Inserted/Updated all ${productsToInsert.length} products in drobe_products!`);

  console.log('--- Database Seeding Complete ---');
}

seed().catch(err => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
