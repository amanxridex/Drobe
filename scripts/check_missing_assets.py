import os
import re

asset_pattern = re.compile(r'["\'](/assets/[^"\']+)["\']')
missing_assets = []

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root or '.git' in root or 'scripts' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.js')):
            fpath = os.path.join(root, file)
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            matches = asset_pattern.findall(content)
            for m in matches:
                # remove query params
                clean_path = m.split('?')[0]
                local_path = os.path.join('public', clean_path.lstrip('/'))
                if not os.path.exists(local_path):
                    missing_assets.append((fpath, m, local_path))

print(f"Total checked. Missing assets count: {len(missing_assets)}")
for fpath, m, loc in missing_assets:
    print(f"File: {fpath} -> referenced: {m} (not found at {loc})")
