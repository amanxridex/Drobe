const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOgImage() {
  const logoPath = path.join(__dirname, '../public/drobe-logo-full-white.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoUri = 'data:image/png;base64,' + logoBase64;

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF0A3B"/>
      <stop offset="50%" stop-color="#E5002B"/>
      <stop offset="100%" stop-color="#B8001F"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Solid Gradient Red Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Subtle decorative luxury concentric circles -->
  <circle cx="600" cy="245" r="340" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <circle cx="600" cy="245" r="260" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1" stroke-dasharray="6 6"/>

  <!-- Centered White DROBE Logo with Drop Shadow -->
  <g transform="translate(450, 115)" filter="url(#shadow)">
    <image href="${logoUri}" width="300" height="248" preserveAspectRatio="xMidYMid meet"/>
  </g>

  <!-- Tagline 1: Fashion in 30 minutes | Launching Soon -->
  <text x="600" y="445" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="30" font-weight="800" letter-spacing="1">
    Fashion in 30 minutes | Launching Soon
  </text>

  <!-- Tagline 2: Cities -->
  <text x="600" y="495" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="2">
    Ahmedabad  |  Gurgaon  |  Chandigarh  |  Lucknow
  </text>

  <!-- Domain Pill Badge -->
  <rect x="520" y="535" width="160" height="38" rx="19" fill="rgba(0,0,0,0.28)" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
  <text x="600" y="560" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" letter-spacing="1">
    drobe.one
  </text>
</svg>
`;

  const outputPath = path.join(__dirname, '../public/og-image.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log('Successfully generated public/og-image.png (1200x630)');

  // Also generate a square 512x512 logo version for WhatsApp / circular link previews
  const squareSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#E5002B"/>
  <circle cx="256" cy="256" r="220" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
  <g transform="translate(106, 126)">
    <image href="${logoUri}" width="300" height="248" preserveAspectRatio="xMidYMid meet"/>
  </g>
  <text x="256" y="420" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" letter-spacing="1.5">
    FASHION IN 30 MINS
  </text>
</svg>
`;

  const squareOutputPath = path.join(__dirname, '../public/og-square.png');
  await sharp(Buffer.from(squareSvg))
    .png({ quality: 95 })
    .toFile(squareOutputPath);

  console.log('Successfully generated public/og-square.png (512x512)');
}

generateOgImage().catch(console.error);
