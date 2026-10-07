const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('public/assets/real/women');
const destDir = path.resolve('public/assets/real');

const copyMap = [
  // Category cards
  { src: 'asset_65_app_images_frkn_Dark_-_Women_-_Ethnic_Wear.png', dest: 'cat_women_ethnic_card.png' },
  { src: 'asset_66_app_images_frkn_Dark_-_Women_-_Dresses.png', dest: 'cat_women_dresses_card.png' },
  { src: 'asset_67_app_images_frkn_Dark_-_Women_-_Bottom_Wear.png', dest: 'cat_women_bottom_card.png' },
  { src: 'asset_68_app_images_frkn_Dark_-_Women_-_Top_Wear.png', dest: 'cat_women_top_card.png' },
  { src: 'asset_69_app_images_frkn_Dark_-_Women_-_Foot_Wear.png', dest: 'cat_women_footwear_card.png' },

  // Lookbook hero slides
  { src: 'asset_79_app_images_25436734612558_534899ea-7dcd-4644-b737-e6000fd10213_20261005-202842.webp', dest: 'lookbook_women_1_dandiya.webp' },
  { src: 'asset_80_app_images_34858921442568_30b8c83f-f911-430b-a187-6aec27c155ad_20261006-150735.webp', dest: 'lookbook_women_2_desibaddie.webp' },
  { src: 'asset_81_app_images_20725419810337_be481925-f35b-4f44-a7a9-f9532966d5b9_20260905-183452.webp', dest: 'lookbook_women_3_chkokko.webp' },
  { src: 'asset_110_app_images_18139575463325_4f11d518-a9b0-4e8a-914e-0544ed74c9cc_20261001-083510.webp', dest: 'lookbook_women_4_souledstore.webp' },
  { src: 'asset_112_app_images_81344209331689_2e5d8025-d590-45e0-99b6-7e25ac9a0a05_20260923-213701.webp', dest: 'lookbook_women_5_pinkfort.webp' },
  { src: 'asset_77_app_images_12860501681708_e3e218b0-ec42-4a0a-adbb-f7d167ff9d18_20260817-110107.webp', dest: 'lookbook_women_6_nee.webp' },
  { src: 'asset_116_app_images_85290011090995_dc099801-2ad3-4241-bc31-6166ebc7f49d_20260924-063429.webp', dest: 'lookbook_women_7_tequila.webp' },
  { src: 'asset_118_app_images_41331154352004_b4df4d33-6f8d-4f7f-921c-75377c8a817f_20260928-091914.webp', dest: 'lookbook_women_8_tilt.webp' },

  // Women reels badge
  { src: 'w_reels.png', dest: 'w_reels.png' }
];

copyMap.forEach(({ src, dest }) => {
  const sPath = path.join(srcDir, src);
  const dPath = path.join(destDir, dest);
  if (fs.existsSync(sPath)) {
    fs.copyFileSync(sPath, dPath);
    console.log(`Copied ${src} -> ${dest}`);
  } else {
    console.warn(`Source not found: ${src}`);
  }
});
console.log('Clean asset copy complete!');
