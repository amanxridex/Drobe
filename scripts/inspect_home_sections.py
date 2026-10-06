import json

with open('scripts/intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cd = data[11]['component_data']
for i, c in enumerate(cd):
    if isinstance(c, dict):
        h = c.get('heading')
        t = c.get('type')
        cid = c.get('id')
        items = c.get('items', [])
        if h or t in ['banner', 'row', 'grid', 'carousel']:
            print(f"[{i}] type={t}, id={cid}, heading={h}, items_len={len(items)}")
