import json

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

parents = []

def find_parents(obj, path=""):
    if isinstance(obj, dict):
        has_img = False
        for k, v in obj.items():
            if isinstance(v, str) and 'ik.imagekit.io' in v and 'brand' in v:
                has_img = True
                break
        if has_img:
            parents.append((path, obj))
        for k, v in obj.items():
            find_parents(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            find_parents(item, f"{path}[{i}]")

find_parents(data)
print(f"Total parent objects containing brand imagekit URLs: {len(parents)}")
if parents:
    path, p = parents[0]
    print(f"Path: {path}")
    print("Keys:", list(p.keys()))
    print("Object content:")
    print(json.dumps(p, indent=2)[:800])
