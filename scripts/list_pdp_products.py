import json

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products = []
for item in data:
    if isinstance(item, dict):
        for c in item.get('component_data', []):
            if isinstance(c, dict) and c.get('bloc_id', '').startswith('style_color_list_view_'):
                products.append(c)

print(f"Total style_color_list_view products intercepted: {len(products)}")
for p in products:
    brand = p.get('selected_brand')
    title = p.get('selected_variant_title')
    sp = p.get('select_sp_float')
    photos = len(p.get('current_media', []))
    print(f"ID: {p.get('id')} | Brand: {brand} | SP: {sp} | Photos: {photos} | Title: {title}")
