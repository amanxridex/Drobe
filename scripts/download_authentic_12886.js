const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp:bg-ffffff:if-iar_lt_0.6_or_iar_gt_0.85,w-375,h-498,cm-pad_resize,bg-dominant,if-else,w-375,if-end/brand%2Fspykar%2F8905566564022%2F1.jpg?ik-t=9999999999&ik-s=921e90aa10acbd9589bbf411c3483042dfecfaa4",
  "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp:bg-ffffff:if-iar_lt_0.6_or_iar_gt_0.85,w-375,h-498,cm-pad_resize,bg-dominant,if-else,w-375,if-end/brand%2Fspykar%2F8905566564022%2F2.jpg?ik-t=9999999999&ik-s=d377f4041e4ee51ebe57a5d7bb3adc81fd6363f7",
  "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp:bg-ffffff:if-iar_lt_0.6_or_iar_gt_0.85,w-375,h-498,cm-pad_resize,bg-dominant,if-else,w-375,if-end/brand%2Fspykar%2F8905566564022%2F3.jpg?ik-t=9999999999&ik-s=2ab40f0d88fce01f3ac39a9325405d6ec595e0bf",
  "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp:bg-ffffff:if-iar_lt_0.6_or_iar_gt_0.85,w-375,h-498,cm-pad_resize,bg-dominant,if-else,w-375,if-end/brand%2Fspykar%2F8905566564022%2F4.jpg?ik-t=9999999999&ik-s=6042376f5af548e0c3e83a94a1152fb519790e5c",
  "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp:bg-ffffff:if-iar_lt_0.6_or_iar_gt_0.85,w-375,h-498,cm-pad_resize,bg-dominant,if-else,w-375,if-end/brand%2Fspykar%2F8905566564022%2F5.jpg?ik-t=9999999999&ik-s=9068c93aaf7ea76ff1c28d5d192dbdbfc33f264b",
  "https://ik.imagekit.io/slickapp/droplet/tr:dpr-2,f-webp:bg-ffffff:if-iar_lt_0.6_or_iar_gt_0.85,w-375,h-498,cm-pad_resize,bg-dominant,if-else,w-375,if-end/brand%2Fspykar%2F8905566564022%2F6.jpg?ik-t=9999999999&ik-s=0ea8045a956941dec24f8f87143590fdeb0ea144"
];

const destDir = path.join(__dirname, '../public/assets/real/products/12886');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  for (let i = 0; i < urls.length; i++) {
    const dest = path.join(destDir, `angle_${i + 1}.webp`);
    console.log(`Downloading angle_${i + 1}.webp...`);
    await download(urls[i], dest);
  }
  console.log('Finished downloading authentic high-res angles!');
})();
