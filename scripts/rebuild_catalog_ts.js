const fs = require('fs');
const path = require('path');

const rawProds = JSON.parse(fs.readFileSync('data/real_catalog.json', 'utf8'));

const womenBrands = new Set([
  'Chumbak', 'trueBrowns', 'GIVA', 'Cava Athleisure', 'Dalchinii', 'PEACH', 
  'THE CLOTHING FACTORY', 'Vasavi', 'Sassafras', 'KALKI', 'Pink Fort', 'MyWishBag', 'Divena', 'Tequila', 'Tilt'
]);

const menBrands = new Set([
  'SNITCH', 'The Indian Garage Co', 'The Bear House', 'Thomas Scott', 'Powerlook',
  'Javinishka', 'Manyavar', 'TASVA', 'Banana Club', 'OneMile', 'BLUE TYGA', 'Smokeshow',
  'The Kurta Studio', 'Hancock', 'Bene Kleed'
]);

function mapCategory(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('ethnic')) return 'ethnic';
  if (c.includes('bottom') || c.includes('pant') || c.includes('jeans')) return 'bottom';
  if (c.includes('foot') || c.includes('shoe') || c.includes('slipper') || c.includes('sandal')) return 'footwear';
  if (c.includes('accessories') || c.includes('jewellery') || c.includes('decor') || c.includes('watch')) return 'accessories';
  if (c.includes('dress')) return 'dresses';
  return 'top';
}

const tsProducts = [];

rawProds.forEach((p, idx) => {
  const brand = p.brand || 'Knot';
  const title = p.title || '';
  const titleLower = title.toLowerCase();
  const cat = (p.category || '').toLowerCase();
  const sub = (p.sub_category || '').toLowerCase();
  const text = `${titleLower} ${cat} ${sub}`;

  let isWomen = false;
  if (titleLower.includes("men's") || titleLower.includes("men ") || titleLower.includes("for men")) {
    isWomen = false;
  } else if (womenBrands.has(brand)) {
    isWomen = true;
  } else if (menBrands.has(brand)) {
    isWomen = false;
  } else if (text.includes("women") || text.includes("dress") || text.includes("kurti") || text.includes("saree") || text.includes("anarkali") || text.includes("crop top") || text.includes("skirt") || text.includes("earring") || text.includes("corset")) {
    isWomen = true;
  } else {
    // If neutral/unisex brand (Souled Store, Hexafun, Underrated club, Veirdo):
    // Distribute 1/4 to women so women catalog is rich with real street styles
    if (idx % 4 === 0) {
      isWomen = true;
    } else {
      isWomen = false;
    }
  }

  const pid = String(p.id);
  const images = p.images || [];
  if (!images.length) return;

  const price = Number(p.selling_price) || 999;
  const originalPrice = Number(p.mrp) || Math.round(price * 1.35);
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  const mappedCat = isWomen && text.includes('dress') ? 'dresses' : mapCategory(p.category);

  tsProducts.push({
    id: pid,
    brand,
    title,
    price,
    originalPrice,
    discountPercentage: Math.max(0, discount),
    gender: isWomen ? 'women' : 'men',
    category: mappedCat,
    subCategory: p.sub_category || p.category || 'Fashion',
    images,
    thumbnail: images[0],
    description: p.description || '',
    fabric: 'Cotton Blend',
    fit: 'Relaxed Fit',
    rating: 4.8,
    reviewsCount: 142,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    tryAndBuyEligible: true,
    deliveryMinutes: 60,
    deliveryLocation: 'Shreepal Complex, Suren Rd, Mumbai',
    promoTag: "Today's Best Price",
    couponPromo: 'Coupon: KNOTFESTIVE999'
  });
});

console.log(`Rebuilt ${tsProducts.length} products. Men: ${tsProducts.filter(p => p.gender === 'men').length}, Women: ${tsProducts.filter(p => p.gender === 'women').length}`);

// Read existing manifests
const sectionsManifest = JSON.parse(fs.readFileSync('data/sections_manifest.json', 'utf8'));
const catGridManifest = JSON.parse(fs.readFileSync('data/categories_grid_manifest.json', 'utf8'));

const womenSectionsManifest = {
  brandPartners: [
    { name: 'Pink Fort', img: '/assets/real/lookbook_women_5_pinkfort.webp', tag: 'New Collection' },
    { name: 'Chkokko', img: '/assets/real/lookbook_women_3_chkokko.webp', tag: 'Buy 2 Get 5% Off' },
    { name: 'The Souled Store', img: '/assets/real/lookbook_women_4_souledstore.webp', tag: 'Buy 1 Get 1' },
    { name: 'Vasavi', img: '/assets/real/lookbook_women_1_dandiya.webp', tag: 'Dandiya Drops' },
    { name: 'trueBrowns', img: '/assets/real/lookbook_women_2_desibaddie.webp', tag: 'Desi Baddie' },
    { name: 'Chumbak', img: '/assets/real/sections/16_chumbak_1.webp', tag: 'Festive Decor' },
    { name: 'Tequila', img: '/assets/real/lookbook_women_7_tequila.webp', tag: 'Dress Like a Shot' },
    { name: 'Tilt', img: '/assets/real/lookbook_women_8_tilt.webp', tag: 'Bamboo Loungewear' }
  ],
  banners: {
    pinkFort: '/assets/real/lookbook_women_5_pinkfort.webp',
    chkokko: '/assets/real/lookbook_women_3_chkokko.webp',
    souledStore: '/assets/real/lookbook_women_4_souledstore.webp',
    desiBaddie: '/assets/real/lookbook_women_2_desibaddie.webp',
    dandiyaDrops: '/assets/real/lookbook_women_1_dandiya.webp'
  }
};

const womenCategoriesGrid = [
  { name: 'Kurtas & Sets', img: '/assets/real/cat_women_sub_kurtas.webp', route: '/collection/ethnic' },
  { name: 'Party Dresses', img: '/assets/real/cat_women_dresses_card.png', route: '/collection/dresses' },
  { name: 'Sarees', img: '/assets/real/cat_women_sub_sarees.webp', route: '/collection/ethnic' },
  { name: 'Suits', img: '/assets/real/cat_women_sub_suits.webp', route: '/collection/ethnic' },
  { name: 'Corsets & Tops', img: '/assets/real/cat_women_sub_corsets.webp', route: '/collection/top' },
  { name: 'Sweaters & Knits', img: '/assets/real/cat_women_sub_sweaters.webp', route: '/collection/top' },
  { name: 'Pyjamas & Lounge', img: '/assets/real/cat_women_sub_pyjamas.webp', route: '/collection/bottom' },
  { name: 'Jewellery', img: '/assets/real/cat_women_sub_jewellery.webp', route: '/collection/accessories' }
];

const reels = [
  {
    id: 'reel-1',
    creator: '@thesouledstore',
    caption: 'Fire fits delivered in 60 mins! Check out the new cable knit polo combo 🔥',
    videoUrl: '/assets/videos/knot_splash.mp4',
    likes: '24.2k',
    productId: '36440',
    productName: "Men's Colorblocked Cable-Knit Polo T-Shirt",
    price: 1715,
    gender: 'men'
  },
  {
    id: 'reel-2',
    creator: '@snitch_official',
    caption: 'Everyday Essentials Elevated. 3 fire looks for everyday street luxury.',
    videoUrl: '/assets/videos/knot_splash.mp4',
    likes: '32.8k',
    productId: '33058',
    productName: "Men's Relaxed Fit Cotton Shirt",
    price: 999,
    gender: 'men'
  },
  {
    id: 'reel-3',
    creator: '@tasva_india',
    caption: 'Festive season styling with authentic designer kurtas. Try at home before paying!',
    videoUrl: '/assets/videos/knot_splash.mp4',
    likes: '18.7k',
    productId: '12886',
    productName: 'Designer Festive Kurta',
    price: 1499,
    gender: 'men'
  },
  {
    id: 'reel-w-1',
    creator: '@pinkfort_india',
    caption: 'Dandiya Night Glam! Pure Silk Anarkalis and Sets delivered in 60 mins ✨',
    videoUrl: '/assets/videos/knot_splash.mp4',
    likes: '38.4k',
    productId: '14195',
    productName: 'Black Ikat Print Mandarin Collar Co Ord Set',
    price: 2250,
    gender: 'women'
  },
  {
    id: 'reel-w-2',
    creator: '@chkokko_women',
    caption: 'Effortless fits for workouts and chilling. Buy 2 Get 5% Off, Buy 3 Get 10% Off 🔥',
    videoUrl: '/assets/videos/knot_splash.mp4',
    likes: '45.1k',
    productId: '14381',
    productName: 'Oversized Light Gray Teddy Fleece Hoodie',
    price: 2059,
    gender: 'women'
  },
  {
    id: 'reel-w-3',
    creator: '@chumbak',
    caption: 'Quirky prints and colourful vibes! Try at home before you buy 🌸',
    videoUrl: '/assets/videos/knot_splash.mp4',
    likes: '29.3k',
    productId: '19379',
    productName: 'Cottagecore Coral Red & Mint Aqua Gift Set',
    price: 1568,
    gender: 'women'
  }
];

const header = `export interface Product {
  id: string;
  brand: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  gender: 'men' | 'women';
  category: string;
  subCategory: string;
  images: string[];
  thumbnail: string;
  description: string;
  fabric: string;
  fit: string;
  rating: number;
  reviewsCount: number;
  sizes: string[];
  inStock: boolean;
  tryAndBuyEligible: boolean;
  extraDiscountBadge?: string;
  deliveryMinutes: number;
  deliveryLocation: string;
  promoTag?: string;
  couponPromo?: string;
}

export const CATEGORIES_DATA = {
  men: [
    { id: 'ethnic', name: 'Ethnic Wear', icon: '/assets/icons/collection/ethnic.svg', image: '/assets/real/cat_ethnic.webp' },
    { id: 'bottom', name: 'Bottom Wear', icon: '/assets/icons/collection/denims.svg', image: '/assets/real/cat_bottom.webp' },
    { id: 'top', name: 'Top Wear', icon: '/assets/icons/collection/casualwear.svg', image: '/assets/real/cat_top.webp' },
    { id: 'footwear', name: 'Foot Wear', icon: '/assets/icons/collection/footwear.svg', image: '/assets/real/cat_footwear.webp' },
    { id: 'accessories', name: 'Accessories', icon: '/assets/icons/collection/accessories.svg', image: '/assets/real/cat_accessories.webp' }
  ],
  women: [
    { id: 'ethnic', name: 'Ethnic Wear', icon: '/assets/icons/collection/ethnic.svg', image: '/assets/real/cat_women_ethnic_card.png' },
    { id: 'dresses', name: 'Dresses', icon: '/assets/icons/collection/casualwear.svg', image: '/assets/real/cat_women_dresses_card.png' },
    { id: 'bottom', name: 'Bottom Wear', icon: '/assets/icons/collection/denims.svg', image: '/assets/real/cat_women_bottom_card.png' },
    { id: 'top', name: 'Top Wear', icon: '/assets/icons/collection/casualwear.svg', image: '/assets/real/cat_women_top_card.png' },
    { id: 'footwear', name: 'Foot Wear', icon: '/assets/icons/collection/footwear.svg', image: '/assets/real/cat_women_footwear_card.png' }
  ]
};
`;

const fileContent = 
  header + '\n' +
  'export const PRODUCTS: Product[] = ' + JSON.stringify(tsProducts, null, 2) + ';\n\n' +
  'export const REELS_DATA = ' + JSON.stringify(reels, null, 2) + ';\n\n' +
  'export const SECTIONS_MANIFEST = ' + JSON.stringify(sectionsManifest, null, 2) + ';\n\n' +
  'export const CATEGORIES_GRID_MANIFEST = ' + JSON.stringify(catGridManifest, null, 2) + ';\n\n' +
  'export const WOMEN_SECTIONS_MANIFEST = ' + JSON.stringify(womenSectionsManifest, null, 2) + ';\n\n' +
  'export const WOMEN_CATEGORIES_GRID = ' + JSON.stringify(womenCategoriesGrid, null, 2) + ';\n';

fs.writeFileSync('data/catalog.ts', fileContent, 'utf8');
console.log('Successfully wrote data/catalog.ts!');
