import json

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Search for any object that contains product details or style details
styles_found = []

def search(obj):
    if isinstance(obj, dict):
        if 'style_name' in obj or 'product_title' in obj or 'selling_price' in obj or 'brand_name' in obj or 'style_code' in obj or 'mrp' in obj or 'display_name' in obj:
            styles_found.append(obj)
        for v in obj.values():
            search(v)
    elif isinstance(obj, list):
        for item in obj:
            search(item)

search(data)
print(f'Total style/product objects found: {len(styles_found)}')
if styles_found:
    print('Sample object keys:', list(styles_found[0].keys()))
    print('Sample object:', json.dumps(styles_found[0], indent=2)[:600])
