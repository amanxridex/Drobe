import json
import os

with open(r'c:\Users\User\Drobe\data\real_catalog.json', 'r', encoding='utf-8') as f:
    raw_products = json.load(f)

print(f"Loaded {len(raw_products)} raw products.")

with open(r'c:\Users\User\Drobe\data\sections_manifest.json', 'r', encoding='utf-8') as f:
    sections_manifest = json.load(f)

with open(r'c:\Users\User\Drobe\data\categories_grid_manifest.json', 'r', encoding='utf-8') as f:
    cat_grid_manifest = json.load(f)

def map_category(cat):
    cat_lower = (cat or '').lower()
    if 'ethnic' in cat_lower:
        return 'ethnic'
    elif 'bottom' in cat_lower:
        return 'bottom'
    elif 'foot' in cat_lower or 'shoe' in cat_lower or 'sandal' in cat_lower or 'slipper' in cat_lower:
        return 'footwear'
    elif 'accessories' in cat_lower or 'jewellery' in cat_lower or 'fragrance' in cat_lower or 'sock' in cat_lower or 'decor' in cat_lower:
        return 'accessories'
    else:
        return 'top'

ts_products = []
for p in raw_products:
    pid = str(p['id'])
    images = p.get('images', [])
    if not images:
        continue
    
    price = int(p.get('selling_price') or 999)
    original_price = int(p.get('mrp') or round(price * 1.35))
    discount = round(((original_price - price) / original_price) * 100) if original_price > price else 0
    
    specs = p.get('specs', {})
    fabric = specs.get('Fabric') or specs.get('Content') or 'Cotton Blend'
    fit = specs.get('Top Fit') or specs.get('Bottom Fit') or specs.get('Fit') or 'Relaxed Fit'
    
    cat = map_category(p.get('category'))
    sub_cat = p.get('sub_category') or p.get('category') or 'Fashion'
    
    ts_products.append({
        'id': pid,
        'brand': p.get('brand', 'Knot'),
        'title': p.get('title', ''),
        'price': price,
        'originalPrice': original_price,
        'discountPercentage': discount,
        'gender': 'men',
        'category': cat,
        'subCategory': sub_cat,
        'images': images,
        'thumbnail': images[0],
        'description': p.get('description', ''),
        'fabric': fabric,
        'fit': fit,
        'rating': 4.8,
        'reviewsCount': 142,
        'sizes': ['S', 'M', 'L', 'XL'],
        'inStock': True,
        'tryAndBuyEligible': True,
        'deliveryMinutes': 60,
        'deliveryLocation': 'Shreepal Complex, Suren Rd, Mumbai',
        'promoTag': 'Today\'s Best Price',
        'couponPromo': 'Coupon: KNOTFESTIVE999'
    })

print(f"Generated {len(ts_products)} valid products with real downloaded photos!")

reels = [
  {
    'id': 'reel-1',
    'creator': '@thesouledstore',
    'caption': 'Fire fits delivered in 60 mins! Check out the new cable knit polo combo 🔥',
    'videoUrl': '/assets/videos/knot_splash.mp4',
    'likes': '24.2k',
    'productId': ts_products[0]["id"],
    'productName': ts_products[0]["title"],
    'price': ts_products[0]["price"],
    'gender': 'men'
  },
  {
    'id': 'reel-2',
    'creator': '@snitch_official',
    'caption': 'Everyday Essentials Elevated. 3 fire looks for everyday street luxury.',
    'videoUrl': '/assets/videos/knot_splash.mp4',
    'likes': '32.8k',
    'productId': ts_products[1]["id"],
    'productName': ts_products[1]["title"],
    'price': ts_products[1]["price"],
    'gender': 'men'
  },
  {
    'id': 'reel-3',
    'creator': '@tasva_india',
    'caption': 'Festive season styling with authentic designer kurtas. Try at home before paying!',
    'videoUrl': '/assets/videos/knot_splash.mp4',
    'likes': '18.7k',
    'productId': ts_products[2]["id"],
    'productName': ts_products[2]["title"],
    'price': ts_products[2]["price"],
    'gender': 'men'
  }
]

header = """export interface Product {
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
    { id: 'ethnic', name: 'Ethnic Wear', icon: '/assets/icons/collection/ethnic.svg', image: '/assets/real/cat_ethnic.webp' },
    { id: 'bottom', name: 'Bottom Wear', icon: '/assets/icons/collection/denims.svg', image: '/assets/real/cat_bottom.webp' },
    { id: 'top', name: 'Top Wear', icon: '/assets/icons/collection/casualwear.svg', image: '/assets/real/cat_top.webp' },
    { id: 'footwear', name: 'Foot Wear', icon: '/assets/icons/collection/footwear.svg', image: '/assets/real/cat_footwear.webp' },
    { id: 'accessories', name: 'Accessories', icon: '/assets/icons/collection/accessories.svg', image: '/assets/real/cat_accessories.webp' }
  ]
};
"""

full_content = (
    header + "\n" +
    "export const PRODUCTS: Product[] = " + json.dumps(ts_products, indent=2) + ";\n\n" +
    "export const REELS_DATA = " + json.dumps(reels, indent=2) + ";\n\n" +
    "export const SECTIONS_MANIFEST = " + json.dumps(sections_manifest, indent=2) + ";\n\n" +
    "export const CATEGORIES_GRID_MANIFEST = " + json.dumps(cat_grid_manifest, indent=2) + ";\n"
)

with open(r'c:\Users\User\Drobe\data\catalog.ts', 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Successfully written enriched catalog.ts!")
