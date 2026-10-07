const https = require('https');
const fs = require('fs');

const urls = [
  { name: 'orig_slice_01.webp', url: "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp,w-375,h-110/app_images%2Ffrkn_Home%20Page%20Banner_Dark_01.png?ik-t=9999999999&ik-s=ae6373c43e074b9c2c68604b9de18c7ece2b6472" },
  { name: 'orig_slice_02.webp', url: "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp,w-375,h-68/app_images%2Ffrkn_Home%20Page%20Banner_Dark_02.png?ik-t=9999999999&ik-s=c93d94d797e78a3ee2a62646892754bd19e9cc1a" },
  { name: 'orig_slice_03.webp', url: "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp,w-375/app_images%2Ffrkn_Home%20Page%20Banner_Dark_03.png?ik-t=9999999999&ik-s=0fcb7a66c14d4c158e9120bab50d6a060b57dd0b" }
];

urls.forEach(item => {
  https.get(item.url, res => {
    console.log(item.name, res.statusCode);
    if (res.statusCode === 200) {
      const file = fs.createWriteStream('public/assets/real/' + item.name);
      res.pipe(file);
      file.on('finish', () => console.log('Downloaded', item.name));
    }
  });
});
