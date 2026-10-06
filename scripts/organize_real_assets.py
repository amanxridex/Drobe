import os
import shutil
from PIL import Image

src_dir = r'c:\Users\User\Drobe\public\assets\captured'
dst_dir = r'c:\Users\User\Drobe\public\assets\real'
os.makedirs(dst_dir, exist_ok=True)

# Copy the exact category icons
cat_map = {
    '26_app_images_2Ffrkn_Dark_20-_20Men_20-_20Ethnic_20Wear.png': 'cat_ethnic.webp',
    '27_app_images_2Ffrkn_Dark_20-_20Men_20-_20Bottom_20Wear.png': 'cat_bottom.webp',
    '28_app_images_2Ffrkn_Dark_20-_20Men_20-_20Top_20Wear.png': 'cat_top.webp',
    '29_app_images_2Ffrkn_Dark_20-_20Men_20-_20Foot_20Wear.png': 'cat_footwear.webp',
    '30_app_images_2Ffrkn_Dark_20-_20Men_20-_20Accessories.png': 'cat_accessories.webp',
    '31_app_images_2Ffrkn_Dark_20-_20Men_20-_20Jewellery.png': 'cat_jewellery.webp',
    '32_app_images_2Ffrkn_Dark_20-_20Men_20-_20Co-Ords.png': 'cat_coords.webp',
    '33_app_images_2Ffrkn_Dark_20-_20Men_20-_20Athleisure.png': 'cat_athleisure.webp',
    '34_app_images_2Ffrkn_Dark_20-_20Men_20-_20Inner_20Wear.png': 'cat_innerwear.webp',
    '10_app_images_2Ffrkn_Home_20Page_20Banner_Dark_01.png': 'festive_sale_header.webp',
    '11_app_images_2Ffrkn_Home_20Page_20Banner_Dark_02.png': 'festive_sale_ribbon.webp',
    '25_app_images_2Ffrkn_Home_20Page_20Banner_Dark_03.png': 'festive_sale_bottom.webp',
    '12_app_images_2FLateDeliveryFloater_20-_20Dark.png': 'late_delivery_floater.webp',
    '18_app_images_2FBottom_20Sheet_Dark_new_frkn.png': 'coupon_bottom_sheet.webp',
    '77_app_images_2Ffrkn_Product_20Pill_Dark.png': 'product_pill_dark.webp',
    '78_brand_2Fchupps_2F10400-415-7_2F1.jpg': 'prod_chupps.webp',
    '79_brand_2Fhouse_of_koala_2Fkp-wn-30_2F1.jpg': 'prod_koala.webp'
}

for src_name, dst_name in cat_map.items():
    s = os.path.join(src_dir, src_name)
    d = os.path.join(dst_dir, dst_name)
    if os.path.exists(s):
        shutil.copy2(s, d)
        print(f"Copied {src_name} -> {dst_name}")

# Now inspect all 750x1001 banners
banner_idx = 0
for f in sorted(os.listdir(src_dir)):
    p = os.path.join(src_dir, f)
    if os.path.isfile(p):
        try:
            with Image.open(p) as img:
                if img.size == (750, 1001):
                    banner_idx += 1
                    target = os.path.join(dst_dir, f"lookbook_banner_{banner_idx}.webp")
                    shutil.copy2(p, target)
                    print(f"Lookbook Banner {banner_idx}: {f} -> {target}")
        except Exception:
            pass
