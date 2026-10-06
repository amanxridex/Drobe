import json
import re
from urllib.parse import unquote

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    text = f.read()

urls = list(set(re.findall(r'https://ik\.imagekit\.io/slickapp/[^\s"\'\\]+', text)))

products_by_brand = {}

for u in urls:
    if 'brand' not in u:
        continue
    # Decode URL
    decoded = unquote(u)
    # Pattern: /brand/{brand_name}/{style_code}/{image_file}
    m = re.search(r'/brand/([^/]+)/([^/]+)/([^/?]+)', decoded)
    if m:
        brand = m.group(1)
        style = m.group(2)
        img_name = m.group(3)
        if brand not in products_by_brand:
            products_by_brand[brand] = {}
        if style not in products_by_brand[brand]:
            products_by_brand[brand][style] = []
        products_by_brand[brand][style].append({
            'img': img_name,
            'url': u
        })

print(f"Total brands identified: {len(products_by_brand)}")
for b, styles in sorted(products_by_brand.items(), key=lambda x: len(x[1]), reverse=True):
    total_imgs = sum(len(imgs) for imgs in styles.values())
    print(f"  Brand: {b:25s} | {len(styles):3d} products | {total_imgs:4d} photos")
