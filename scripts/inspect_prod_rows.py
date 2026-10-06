import json

with open('scripts/intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find all items that have style_color_list_view
products_by_row = {}
for i, item in enumerate(data):
    if isinstance(item, dict) and 'component_data' in item:
        cd = item['component_data']
        # check if there is a product_row header
        pr_header = [c for c in cd if isinstance(c, dict) and c.get('type') == 'product_row']
        prod_ids = [c.get('id') for c in cd if isinstance(c, dict) and c.get('bloc_id', '').startswith('style_color_list_view')]
        if prod_ids:
            header_name = pr_header[0].get('bloc_id') if pr_header else f"row_{i}"
            products_by_row[header_name] = prod_ids

print("Discovered product rows:")
for k, v in list(products_by_row.items())[:10]:
    print(f"  {k}: {len(v)} products -> {v[:5]}")
