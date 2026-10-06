import json

with open(r'c:\Users\User\Drobe\public\assets\captured\captured_image_urls.json', 'r') as f:
    urls = json.load(f)

print(f"Total captured URLs: {len(urls)}")
for u in sorted(urls):
    print("  *", u)
