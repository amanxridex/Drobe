import json

with open('scripts/intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cd = data[11]['component_data']
output_lines = []

for idx in [8, 15, 16, 17, 48, 69]:
    c = cd[idx]
    output_lines.append(f"\n==================== SECTION {idx}: heading={c.get('heading')} (id={c.get('id')}) ====================")
    for k, it in enumerate(c.get('items', [])):
        img_url = ''
        img = it.get('image')
        if isinstance(img, dict):
            img_url = img.get('l') or img.get('d') or ''
        elif isinstance(img, str):
            img_url = img
        output_lines.append(f"  [{k}] title={it.get('title')}, deeplink={it.get('deeplink')}, img={img_url}")

with open('scripts/detailed_sections_dump.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print("Dumped successfully!")
