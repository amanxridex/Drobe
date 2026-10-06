import json
import os
import re
import urllib.request
import time

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Extract all unique style_color_list_view products
products_by_id = {}
for item in data:
    if isinstance(item, dict):
        for c in item.get('component_data', []):
            if isinstance(c, dict) and c.get('bloc_id', '').startswith('style_color_list_view_'):
                pid = str(c.get('id'))
                if pid not in products_by_id:
                    products_by_id[pid] = c

print(f"Total unique products to process: {len(products_by_id)}")

# Output directory for authentic downloaded product assets
out_dir = r'c:\Users\User\Drobe\public\assets\real\products'
os.makedirs(out_dir, exist_ok=True)

# Also create catalog summary
catalog_data = []

downloaded_count = 0
failed_count = 0

for pid, prod in products_by_id.items():
    brand = prod.get('selected_brand', 'Knot')
    title = prod.get('selected_variant_title', f'Product {pid}')
    sp = prod.get('select_sp_float', 0)
    category = prod.get('selected_variant_category', 'Fashion')
    sub_category = prod.get('selected_variant_sub_category', '')
    
    # Extract description and specs
    specs = {}
    description = ""
    for d in prod.get('product_details', []):
        if d.get('type') == 'description':
            description = d.get('value', '')
        elif d.get('type') == 'details':
            for s in d.get('values', []):
                if isinstance(s, dict):
                    specs.update(s)
    
    # Process images
    local_images = []
    prod_folder = os.path.join(out_dir, pid)
    os.makedirs(prod_folder, exist_ok=True)
    
    media_list = prod.get('current_media', [])
    for idx, m in enumerate(media_list):
        media_url_obj = m.get('media_url', {})
        url = media_url_obj.get('l') or media_url_obj.get('d')
        if not url:
            continue
        
        ext = '.webp' if '.webp' in url else '.jpg' if '.jpg' in url else '.png'
        filename = f"angle_{idx + 1}{ext}"
        filepath = os.path.join(prod_folder, filename)
        web_path = f"/assets/real/products/{pid}/{filename}"
        
        if os.path.exists(filepath) and os.path.getsize(filepath) > 500:
            local_images.append(web_path)
            continue
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp, open(filepath, 'wb') as f:
                f.write(resp.read())
            downloaded_count += 1
            local_images.append(web_path)
            if downloaded_count % 20 == 0:
                print(f"[{downloaded_count}] Downloaded: {brand} - {title[:30]} ({filename})")
        except Exception as e:
            failed_count += 1
            print(f"Failed to download image {url}: {e}")
    
    catalog_data.append({
        'id': pid,
        'brand': brand,
        'title': title,
        'selling_price': sp,
        'mrp': round(sp * 1.35) if sp else 0,
        'category': category,
        'sub_category': sub_category,
        'description': description,
        'specs': specs,
        'images': local_images,
        'delivery_display': prod.get('delivery_display', '60 minutes'),
        'try_on_enabled': prod.get('try_on_enabled', True),
        'sizes': ['S', 'M', 'L', 'XL']
    })

# Save structured real catalog JSON
catalog_json_path = r'c:\Users\User\Drobe\data\real_catalog.json'
os.makedirs(os.path.dirname(catalog_json_path), exist_ok=True)
with open(catalog_json_path, 'w', encoding='utf-8') as f:
    json.dump(catalog_data, f, indent=2)

print("\n==========================================")
print(f"SUCCESSFULLY DOWNLOADED {downloaded_count} REAL PRODUCT PHOTOS!")
print(f"Saved {len(catalog_data)} real catalog products to {catalog_json_path}!")
print(f"Failed downloads: {failed_count}")
print("==========================================")
