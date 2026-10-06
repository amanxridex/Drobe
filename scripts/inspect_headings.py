import json

with open('scripts/intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total intercepted items: {len(data)}")
for i in range(len(data)):
    item = data[i]
    if isinstance(item, dict) and 'component_data' in item:
        cd = item['component_data']
        previews = [c for c in cd if isinstance(c, dict) and c.get('type') == 'preview']
        if previews:
            p = previews[0]
            print(f"[{i}] headline: {p.get('headline')} | desc: {p.get('description')} | promo: {p.get('promo')}")
