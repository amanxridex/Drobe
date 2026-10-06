import json

with open('scripts/pdp_12886_dump.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data.get('interceptedData', []):
    url = item.get('url')
    print("=== URL ===", url)
    content = item.get('json', {})
    if 'detailed' in url:
        print("Detailed keys:", content.keys() if isinstance(content, dict) else type(content))
        # print some key fields
        if isinstance(content, dict):
            # check layout or data
            print(json.dumps(content, indent=2)[:2000])
    elif 'style_it_with' in url:
        print("Style it with sample:", json.dumps(content, indent=2)[:1000])
    elif 'similar' in url:
        print("Similar sample:", json.dumps(content, indent=2)[:1000])
