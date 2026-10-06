import re
import json

# 1. Search captured URLs for brand/ paths
with open(r'c:\Users\User\Drobe\public\assets\captured\captured_image_urls.json', 'r') as f:
    urls = json.load(f)

brand_paths = set()
for u in urls:
    m = re.findall(r'brand%2F([^%2F\/]+)', u)
    if m:
        brand_paths.update(m)
    m2 = re.findall(r'/brand/([^/]+)', u)
    if m2:
        brand_paths.update(m2)

print("Brands found in ImageKit URLs:", brand_paths)

# 2. Search main.dart.js for brand names, brand lists, brand collections
with open(r'C:\Users\User\.gemini\antigravity-ide\brain\332716db-ce87-46f5-ad9a-273548ee217f\scratch\main.dart.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Look for brand patterns
brand_matches = re.findall(r'["\']brand_name["\'],\s*["\']([^"\']+)["\']', text)
print("brand_name occurrences:", list(set(brand_matches))[:30])

# Look for brands array or brand list
all_brand_snippets = re.findall(r'["\']brand[s]?["\']\s*:\s*\[([^\]]+)\]', text)
print("brand lists found:", len(all_brand_snippets))
