import json
import re

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    text = f.read()

urls = list(set(re.findall(r'https://ik\.imagekit\.io/slickapp/[^\s"\'\\]+', text)))
print(f'Total ImageKit URLs found in intercepted JSON: {len(urls)}')

brand_urls = [u for u in urls if 'brand' in u]
app_urls = [u for u in urls if 'app_images' in u]
print(f'Brand / product URLs: {len(brand_urls)}')
print(f'App / UI URLs: {len(app_urls)}')

for u in brand_urls[:15]:
    print('BRAND URL:', u)
