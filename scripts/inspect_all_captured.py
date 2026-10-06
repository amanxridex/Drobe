import os
from PIL import Image

src_dir = r'c:\Users\User\Drobe\public\assets\captured'
files = sorted([f for f in os.listdir(src_dir) if f.startswith('app_images') or '_' in f])

for f in files:
    full_path = os.path.join(src_dir, f)
    if not os.path.isfile(full_path):
        continue
    try:
        with Image.open(full_path) as img:
            print(f"{f}: {img.size} {img.format}")
    except Exception as e:
        pass
