from PIL import Image

# Crop the top two cards from verified_trending_showcase.png
im_ours = Image.open('verified_trending_showcase.png')
# Viewport is 446 * 2 = 892 width
w, h = im_ours.size

# Let's crop the trending section with the top two cards
# The cards start around y = 45 to y = 430 in css pixels, so y * 2 = 90 to 860
crop_ours = im_ours.crop((20, 80, w - 20, 840))
crop_ours.save('our_new_product_showcase_crop.png')
print("Successfully generated our_new_product_showcase_crop.png")
