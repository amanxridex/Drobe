import os
import shutil
from PIL import Image

src_dir = r'c:\Users\User\Drobe\public\assets\captured'
dst_dir = r'c:\Users\User\Drobe\public\assets\knot_cdn'
os.makedirs(dst_dir, exist_ok=True)

files = os.listdir(src_dir)
print(f"Total files in captured: {len(files)}")

for f in files:
    full_path = os.path.join(src_dir, f)
    if os.path.isdir(full_path):
        continue
    try:
        with Image.open(full_path) as img:
            w, h = img.size
            fmt = img.format
            # Print important files
            if any(k in f.lower() for k in ['banner', 'ethnic', 'bottom', 'top', 'foot', 'accessories', 'floater', 'chupps', 'koala', 'product', 'pill', 'qr', 'knot']):
                print(f"{f} -> {w}x{h} ({fmt})")
    except Exception as e:
        # SVG or non-image
        if f.endswith('.svg') or f.endswith('.json'):
            print(f"{f} -> text/svg")
