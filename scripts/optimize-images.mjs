import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function optimizeImages() {
  console.log('Optimizing images with Sharp...');

  // 1. Manju Manuel & Prince Jose (2.1MB PNGs -> compact WebP)
  if (fs.existsSync('images/manju_manuel.png')) {
    await sharp('images/manju_manuel.png')
      .resize(400, 400, { fit: 'cover', position: 'top' })
      .webp({ quality: 82 })
      .toFile('images/manju_manuel.webp');
    console.log('Generated images/manju_manuel.webp');
  }

  if (fs.existsSync('images/prince_jose.png')) {
    await sharp('images/prince_jose.png')
      .resize(400, 400, { fit: 'cover', position: 'top' })
      .webp({ quality: 82 })
      .toFile('images/prince_jose.webp');
    console.log('Generated images/prince_jose.webp');
  }

  if (fs.existsSync('images/latha-teacher-1024x497-1-e1606356462176.jpg')) {
    await sharp('images/latha-teacher-1024x497-1-e1606356462176.jpg')
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 82 })
      .toFile('images/latha_raj.webp');
    console.log('Generated images/latha_raj.webp');
  }

  // 2. Convert all member JPGs to WebP
  const committee = JSON.parse(fs.readFileSync('data/committee.json', 'utf8'));

  // Update advisors
  committee.advisors[0].photo = 'images/manju_manuel.webp';
  committee.advisors[1].photo = 'images/prince_jose.webp';
  committee.advisors[2].photo = 'images/latha_raj.webp';

  for (const m of committee.members) {
    if (m.photo && fs.existsSync(m.photo)) {
      const ext = path.extname(m.photo);
      const webpPath = m.photo.replace(ext, '.webp');
      if (fs.existsSync(webpPath)) {
        m.photo = webpPath;
        continue;
      }
      try {
        await sharp(m.photo)
          .resize(320, 320, { fit: 'cover', position: 'center' })
          .webp({ quality: 80 })
          .toFile(webpPath);
        m.photo = webpPath;
      } catch (err) {
        console.warn(`Could not convert ${m.photo}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync('data/committee.json', JSON.stringify(committee, null, 2));
  console.log('Updated data/committee.json with WebP paths');

  // 3. Generate 1200x630 OG Image
  // Background: #0B3C5D, text: "Oasis GEC Idukki", subtitle: "Spreading Hope, Building Empathy"
  const logoBuffer = fs.existsSync('images/oasis-logo.png')
    ? await sharp('images/oasis-logo.png').resize(240, 240, { fit: 'contain', background: { r: 11, g: 60, b: 93, alpha: 0 } }).png().toBuffer()
    : null;

  const svgOg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#07263B" />
          <stop offset="100%" stop-color="#0B3C5D" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="#30AFFF" stroke-opacity="0.25" stroke-width="2"/>
      <g transform="translate(600, 380)" text-anchor="middle">
        <text y="0" font-family="Lora, Georgia, serif" font-size="56" font-weight="bold" fill="#FFFFFF">Oasis GEC Idukki</text>
        <text y="50" font-family="Inter, sans-serif" font-size="24" font-weight="500" fill="#EBF7FF">Spreading Hope, Building Empathy • Palliative Care Unit</text>
        <text y="90" font-family="Inter, sans-serif" font-size="18" fill="#30AFFF">Government Engineering College Idukki</text>
      </g>
    </svg>
  `;

  const ogComposite = [{ input: Buffer.from(svgOg), top: 0, left: 0 }];
  if (logoBuffer) {
    ogComposite.push({ input: logoBuffer, top: 90, left: 480 });
  }

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: '#0B3C5D'
    }
  })
  .composite(ogComposite)
  .jpeg({ quality: 90 })
  .toFile('images/og-image.jpg');
  console.log('Generated images/og-image.jpg (1200x630)');

  // 4. Generate Favicons: favicon.svg, favicon.ico (png), apple-touch-icon.png
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#0B3C5D"/>
    <path d="M32 14c-4.4 0-8 3.6-8 8 0 5 8 16 8 16s8-11 8-16c0-4.4-3.6-8-8-8z" fill="#D9532F"/>
    <circle cx="32" cy="22" r="3.5" fill="#FFFFFF"/>
    <path d="M20 48c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="none" stroke="#30AFFF" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
  fs.writeFileSync('favicon.svg', faviconSvg);
  console.log('Generated favicon.svg');

  await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .png()
    .toFile('apple-touch-icon.png');
  console.log('Generated apple-touch-icon.png (180x180)');

  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile('favicon.ico');
  console.log('Generated favicon.ico (32x32)');
}

optimizeImages().catch(err => {
  console.error(err);
  process.exit(1);
});
