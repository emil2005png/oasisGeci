import fs from 'node:fs';
import path from 'node:path';

fs.mkdirSync('fonts', { recursive: true });

const cssUrl = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;0,700;1,400&display=swap";
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

console.log('Fetching Google Fonts stylesheet...');
const res = await fetch(cssUrl, { headers: { 'User-Agent': ua } });
const cssText = await res.text();

// Parse blocks and download only latin blocks
const blocks = cssText.split('/* ');
let localCss = '';
let fontCounter = 0;

for (const b of blocks) {
  if (!b.includes('*/')) continue;
  const [subset, blockBody] = b.split('*/');
  if (subset.trim() !== 'latin') continue; // Only download latin subset

  const familyMatch = blockBody.match(/font-family:\s*['"]?([^'";]+)['"]?/);
  const styleMatch = blockBody.match(/font-style:\s*([^;]+);/);
  const weightMatch = blockBody.match(/font-weight:\s*([^;]+);/);
  const urlMatch = blockBody.match(/src:\s*url\(([^)]+)\)/);

  if (!familyMatch || !weightMatch || !urlMatch) continue;

  const family = familyMatch[1].trim();
  const style = styleMatch ? styleMatch[1].trim() : 'normal';
  const weight = weightMatch[1].trim();
  const remoteUrl = urlMatch[1].trim();

  const fileName = `${family.toLowerCase()}-${style}-${weight}.woff2`;
  const filePath = path.join('fonts', fileName);

  console.log(`Downloading ${fileName}...`);
  const fontRes = await fetch(remoteUrl);
  if (fontRes.ok) {
    const buffer = Buffer.from(await fontRes.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    fontCounter++;

    localCss += `
@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('../fonts/${fileName}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;
  }
}

fs.writeFileSync('css/fonts.css', localCss.trim());
console.log(`Downloaded ${fontCounter} fonts and wrote css/fonts.css`);
