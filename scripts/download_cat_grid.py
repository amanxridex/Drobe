import json
import os
import urllib.request

with open('scripts/intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cd = data[11]['component_data']
cat_sections = [2, 4, 5, 6, 7]

os.makedirs('public/assets/real/categories_grid', exist_ok=True)
cat_manifest = {}

for sec_idx in cat_sections:
    c = cd[sec_idx]
    cid = c.get('id')
    items = c.get('items', [])
    cat_manifest[sec_idx] = []
    
    for k, it in enumerate(items):
        im = it.get('image_media') or {}
        m_url = im.get('media_url') if isinstance(im, dict) else {}
        url = ''
        if isinstance(m_url, dict):
            url = m_url.get('l') or m_url.get('d') or ''
        alt = (im.get('alt') or f'cat_{k}') if isinstance(im, dict) else f'cat_{k}'
        dl = it.get('deeplink')
        
        if url:
            safe_alt = "".join([c if c.isalnum() else "_" for c in alt]).strip("_").lower()
            fname = f"{sec_idx}_{safe_alt}_{k}.webp"
            fpath = os.path.join('public/assets/real/categories_grid', fname)
            
            if not os.path.exists(fpath):
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=10) as resp, open(fpath, 'wb') as out:
                        out.write(resp.read())
                    print(f"Downloaded category: {fname}")
                except Exception as e:
                    print(f"Error downloading {fname}: {e}")
            
            cat_manifest[sec_idx].append({
                'alt': alt,
                'img': f"/assets/real/categories_grid/{fname}",
                'deeplink': dl
            })

with open('data/categories_grid_manifest.json', 'w', encoding='utf-8') as f:
    json.dump(cat_manifest, f, indent=2)

print("Categories grid processed successfully!")
