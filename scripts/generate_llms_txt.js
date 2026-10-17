const fs = require('fs');
const path = require('path');
const realCatalog = require('../data/real_catalog.json');

const products = Array.isArray(realCatalog) ? realCatalog : Object.values(realCatalog);

const brands = [
  { name: 'What The Flex', desc: 'Heavyweight street denim, oversized graphic tees, and boxy silhouettes.', cat: 'Streetwear' },
  { name: 'Chapter 2', desc: 'Utility streetwear, relaxed cargoes, and statement drop-shoulder hoodies.', cat: 'Streetwear & Cargoes' },
  { name: 'Main Character', desc: 'Trend-setting Gen-Z aesthetics, textured knits, and statement jackets.', cat: 'Casualwear' },
  { name: 'The Souled Store', desc: 'Pop-culture oversized tees, co-ord sets, and everyday premium casuals.', cat: 'Casualwear & Co-Ords' },
  { name: 'GENRAGE', desc: 'Acid-washed boxy cuts, luxury graphic tees, and minimalist hoodies.', cat: 'Streetwear' },
  { name: 'Ikoho', desc: 'Modern linen casuals, camp collar shirts, and breathable resort wear.', cat: 'Resort & Casual' },
  { name: 'Powerlook', desc: 'Modern heritage streetwear, relaxed corduroy shirts, and baggy denims.', cat: 'Denim & Streetwear' },
  { name: 'Rawayi', desc: 'Contemporary ethnic kurtas, mirror-work bundis, and festive sets.', cat: 'Ethnic & Festive' },
  { name: 'CALDRI', desc: 'Tailored luxury basics, clean-cut polos, and versatile bottoms.', cat: 'Basics & Polos' },
  { name: 'House of Koala', desc: 'Eco-friendly premium cotton tees, relaxed trousers, and smart casuals.', cat: 'Smart Casual' },
  { name: 'IWE STUDIOS', desc: 'Exclusive capsule drops, luxury streetwear, and distressed denim.', cat: 'Capsule Drops' },
  { name: 'Vastramay', desc: 'Royal wedding wear, brocade nehru jackets, and embroidered kurta sets.', cat: 'Ethnic' },
  { name: 'SNITCH', desc: 'Fast drops, street denim, and runway-inspired shirts.', cat: 'Fast Fashion' },
  { name: 'TASVA', desc: 'Designer kurta sets, bundis, and wedding essentials by Tarun Tahiliani.', cat: 'Luxury Ethnic' },
  { name: 'Manyavar', desc: 'Celebration wear, sherwanis, and festive kurta sets.', cat: 'Festive Wear' },
  { name: 'GIVA', desc: '925 sterling fine silver jewellery and minimalist fashion accessories.', cat: 'Fine Jewellery' },
  { name: 'Chumbak', desc: 'Boho lifestyle, analog watches, and colourful accessories.', cat: 'Watches & Accessories' },
  { name: 'KALKI Fashion', desc: 'Haute couture lehengas, pre-draped sarees, and gowns.', cat: 'Designer Couture' }
];

// 1. Generate public/llms.txt (Concise AI Knowledge Base)
const llmsSummary = `# DROBE — 30-Minute Fashion Delivery & Doorstep Trial
> Canonical Domain: https://drobe.one
> Official Tagline: Fashion in 30 minutes | Launching Soon
> Active Launch Hubs: Ahmedabad (Central Hub #01) · Gurgaon · Chandigarh · Lucknow

## Overview & Business Model
DROBE is India's pioneer quick-commerce fashion platform delivering premium streetwear, casuals, and ethnic collections in under 30 minutes with an integrated 6-minute mirror trial before you buy.

- **Speed**: Under 30-minute doorstep delivery powered by hyper-local darkstores.
- **Try Before You Buy**: Delivery runners carry multiple size options to the customer's doorstep. Customers have a 6-minute mirror trial window to try on garments.
- **Instant Doorstep Return**: Unwanted sizes or items are handed directly back to the runner on the spot with zero courier returns, no repackaging, and no reverse pickup delays.
- **Payment**: Instant UPI on delivery or Cash on Delivery only after keeping preferred items.

## Operational Cities & Darkstore Hubs
1. **Ahmedabad**: Central Hub #01 (Shivam Bungalows 1, Koteshwar Road · Serving Motera, Chandkheda, SG Highway, Bopal, Satellite, Prahlad Nagar).
2. **Gurgaon**: Cyber City & Golf Course Road Express Hub.
3. **Chandigarh**: Sector 17 & Mohali Central Express Zone.
4. **Lucknow**: Gomti Nagar & Hazratganj Express Hub.

## Featured Partner Brands
${brands.map(b => `- [${b.name}](https://drobe.one/brand/${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}) — ${b.desc} (${b.cat})`).join('\n')}

## Core Categories
- [Men's Collection](https://drobe.one/categories) — Oversized tees, cuban shirts, denim, kurtas, sneaker footwear.
- [Women's Collection](https://drobe.one/categories) — Co-ord sets, dresses, festive anarkalis, corsets, 925 silver jewellery.
- [Trending Drops](https://drobe.one/trends) — Fastest moving darkstore drops refreshed weekly.

## Frequently Asked Questions (FAQ)
- **Q: How does 30-minute fashion delivery work?**
  A: Orders are picked and packed in 90 seconds from hyper-local darkstore fulfillment centers and dispatched via express runners with direct turn-by-turn routing.
- **Q: Can I order two sizes to try on?**
  A: Yes! DROBE encourages ordering adjacent sizes. The runner waits while you try on both sizes, and takes back the unkept size immediately.
- **Q: How can I reach DROBE?**
  A: Official Website: https://drobe.one | Official Instagram: https://www.instagram.com/drobe.one

## Detailed Catalog Index
For the complete list of 400+ indexed products with direct purchase URLs, specifications, and prices, visit:
https://drobe.one/llms-full.txt
`;

fs.writeFileSync(path.join(__dirname, '../public/llms.txt'), llmsSummary);
console.log('Successfully generated public/llms.txt');

// 2. Generate public/llms-full.txt (Full AI Catalog Reference)
let llmsFull = `# DROBE Full Product Catalog Knowledge Base
> Canonical Domain: https://drobe.one
> Generated: ${new Date().toISOString()}
> Total Products: ${products.length}

`;

products.forEach((p, idx) => {
  const id = p.id || p.product_id;
  const price = p.selling_price || p.price;
  const mrp = p.mrp || p.originalPrice;
  const brand = p.brand || p.brandName || 'DROBE Collection';
  const title = p.title || p.name;
  const sizes = Array.isArray(p.sizes) ? p.sizes.join(', ') : 'S, M, L, XL';
  const url = `https://drobe.one/product/${id}`;

  llmsFull += `### [${idx + 1}] ${brand} — ${title}
- **Direct Product URL**: ${url}
- **Brand**: ${brand}
- **Category**: ${p.category || 'Apparel'} (${p.sub_category || 'Fashion'})
- **Price**: ₹${price} (MRP: ₹${mrp})
- **Available Sizes**: ${sizes}
- **Delivery**: 30 Minutes Doorstep Fitting
- **Try Before You Buy**: Eligible

`;
});

fs.writeFileSync(path.join(__dirname, '../public/llms-full.txt'), llmsFull);
console.log('Successfully generated public/llms-full.txt');
