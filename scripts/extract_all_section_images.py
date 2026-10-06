import json

with open('scripts/intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cd = data[11]['component_data']
sections_info = []

for idx, c in enumerate(cd):
    if not isinstance(c, dict):
        continue
    items = c.get('items', [])
    t = c.get('type')
    h = c.get('heading')
    cid = c.get('id')
    
    extracted_items = []
    for it in items:
        if not isinstance(it, dict):
            continue
        im = it.get('image_media') or {}
        m_url = im.get('media_url') if isinstance(im, dict) else {}
        url = ''
        if isinstance(m_url, dict):
            url = m_url.get('l') or m_url.get('d') or ''
        alt = im.get('alt') if isinstance(im, dict) else ''
        dl = it.get('deeplink')
        if url:
            extracted_items.append({'alt': alt, 'url': url, 'deeplink': dl})
    
    if extracted_items:
        sections_info.append({
            'idx': idx,
            'type': t,
            'id': cid,
            'heading': h,
            'count': len(extracted_items),
            'items': extracted_items
        })

print(f"Total sections with images: {len(sections_info)}")
for s in sections_info:
    print(f"[{s['idx']}] id={s['id']}, type={s['type']}, heading={s['heading']}, items={s['count']}, first_alt={s['items'][0]['alt']}")
