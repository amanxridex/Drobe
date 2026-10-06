import os
from PIL import Image

for i in range(1, 15):
    p = rf'c:\Users\User\Drobe\public\assets\real\lookbook_banner_{i}.webp'
    if os.path.exists(p):
        with Image.open(p) as img:
            print(f"Banner {i}: size={img.size}, format={img.format}")
