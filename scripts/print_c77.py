import json

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

c77 = data[11]['component_data'][77]
print("Component 77 keys:", list(c77.keys()))
print(json.dumps(c77, indent=2))
