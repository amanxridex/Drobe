import json
import os

p = r'c:\Users\User\Drobe\public\assets\captured\captured_api_payloads.json'
if os.path.exists(p):
    with open(p, 'r', encoding='utf-8', errors='ignore') as f:
        data = json.load(f)
    print(f"Total API payloads captured: {len(data)}")
    for item in data[:10]:
        print("URL:", item.get('url'))
        print("Text snippet:", item.get('text', '')[:150])
        print("-" * 50)
