import os
from PIL import Image

src_path = r'C:\Users\User\.gemini\antigravity-ide\brain\332716db-ce87-46f5-ad9a-273548ee217f\.user_uploaded\media_1791288113280.png'
im = Image.open(src_path).convert('RGB')
w, h = im.size
print("Image size:", w, h)

# Ensure directory exists
out_dir = 'public/assets/real/products/12886'
os.makedirs(out_dir, exist_ok=True)

# Main hero image is located between approx x: 0.05 to 0.95, y: 0.08 to 0.72
# Let's crop the main hero image (without the badges if possible, or high-res product photo)
hero_box = (int(w * 0.05), int(h * 0.085), int(w * 0.95), int(h * 0.72))
hero_img = im.crop(hero_box)
hero_img.save(os.path.join(out_dir, 'angle_1.jpg'), quality=95)

# Thumbnails are located around y: 0.75 to 0.81
# There are 6 thumbnails across the width
thumb_y1 = int(h * 0.75)
thumb_y2 = int(h * 0.81)

# Let's also crop each thumbnail as additional angles!
for i in range(6):
    tx1 = int(w * (0.16 + i * 0.118))
    tx2 = int(w * (0.16 + (i + 1) * 0.118 - 0.02))
    if tx2 <= w:
        t_crop = im.crop((tx1, thumb_y1, tx2, thumb_y2))
        t_crop.save(os.path.join(out_dir, f'angle_{i+2}.jpg'), quality=95)

print("Saved angles for 12886 in", out_dir)
