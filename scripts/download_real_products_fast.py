import json
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products_by_id = {}
for item in data:
    if isinstance(item, dict):
        for c in item.get('component_data', []):
            if isinstance(c, dict) and c.get('bloc_id', '').startswith('style_color_list_view_'):
                pid = str(c.get('id'))
                if pid not in products_by_id:
                    products_by_id[pid] = c

print(f"Total unique products: {len(products_by_id)}")

out_dir = r'c:\Users\User\Drobe\public\assets\real\products'
os.makedirs(out_dir, exist_ok=True)

# Flatten download tasks
tasks = []
catalog_data = []

for pid, prod in products_by_id.items():
    brand = prod.get('selected_brand', 'Knot')
    title = prod.get('selected_variant_title', f'Product {pid}')
    sp = prod.get('select_sp_float', 0)
    category = prod.get('selected_variant_category', 'Fashion')
    sub_category = prod.get('selected_variant_sub_category', '')
    
    specs = {}
    description = ""
    for d in prod.get('product_details', []):
        if d.get('type') == 'description':
            description = d.get('value', '')
        elif d.get('type') == 'details':
            for s in d.get('values', []):
                if isinstance(s, dict):
                    specs.update(s)
    
    prod_folder = os.path.join(out_dir, pid)
    os.makedirs(prod_folder, exist_ok=True)
    
    local_images = []
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
        local_images.append(web_path)
        
        if not (os.path.exists(filepath) and os.path.getsize(filepath) > 500):
            tasks.append((url, filepath, f"{brand} - {pid} (#{idx+1})"))

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

print(f"Total images to download: {len(tasks)}")

def download_image(task):
    url, filepath, label = task
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=12) as resp, open(filepath, 'wb') as f:
            f.write(resp.read())
        return True, label
    except Exception as e:
        return False, f"{label} ({e})"

success_count = 0
failed_count = 0

with ThreadPoolExecutor(max_workers=24) as executor:
    futures = [executor.submit(download_image, t) for t in tasks]
    for i, future in enumerate(as_completed(futures), 1):
        ok, res = future.result()
        if ok:
            success_count += 1
        else:
            failed_count += 1
        if i % 50 == 0 or i == len(tasks):
            print(f"Progress: [{i}/{len(tasks)}] images downloaded. (Success: {success_count}, Failed: {failed_count})")

catalog_json_path = r'c:\Users\User\Drobe\data\real_catalog.json'
os.makedirs(os.path.dirname(catalog_json_path), exist_ok=True)
with open(catalog_json_path, 'w', encoding='utf-8') as f:
    json.dump(catalog_data, f, indent=2)

print(f"\nFINISHED! Saved {len(catalog_data)} products to {catalog_json_path}")
print(f"Total images successfully downloaded: {success_count}")
