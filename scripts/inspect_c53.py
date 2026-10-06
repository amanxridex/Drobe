import json

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Inspect component_data[53] of data[11]
c53 = data[11]['component_data'][53]
print("Component 53 keys:", list(c53.keys()))
print("Component 53 type:", c53.get('type'), "heading:", c53.get('heading'))
if 'items' in c53:
    print(f"Total items in component 53: {len(c53['items'])}")
    print("Item 1:", json.dumps(c53['items'][1], indent=2))
