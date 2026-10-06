import os
from PIL import Image

# Let's inspect the average color / dominant hue of each banner
for i in range(1, 15):
    p = rf'c:\Users\User\Drobe\public\assets\real\lookbook_banner_{i}.webp'
    img = Image.open(p).convert('RGB')
    # sample center pixel colors
    cx, cy = img.width // 2, img.height // 2
    r, g, b = img.getpixel((cx, cy))
    print(f"Banner {i}: center RGB=({r}, {g}, {b})")
