import json
import re

with open(r'c:\Users\User\Drobe\scripts\intercepted_test.json', 'r', encoding='utf-8') as f:
    text = f.read()

urls = list(set(re.findall(r'https://ik\.imagekit\.io/slickapp/[^\s"\'\\]+', text)))

transforms = set()
for u in urls:
    m = re.search(r'tr:([^/]+)/', u)
    if m:
        transforms.add(m.group(1))

print('Unique transforms in intercepted URLs:')
for t in sorted(transforms):
    print(' ', t)
