const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../src-tauri/icons/icon.svg');
const iconsDir = path.join(__dirname, '../src-tauri/icons');

// Icon sizes needed by Tauri
const sizes = [
  32,
  64,
  128,
  [128, 256], // 128x128@2x
];

// Windows square sizes
const windowsSizes = [30, 44, 71, 89, 107, 142, 150, 284, 310];

async function generateIcons() {
  console.log('🎨 Generating icons from SVG...');

  const svgBuffer = fs.readFileSync(svgPath);

  // Generate main icon.png (512x512)
  console.log('📦 Generating icon.png (512x512)...');
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon.png'));

  // Generate standard sizes
  for (const size of sizes) {
    if (Array.isArray(size)) {
      const [base, retina] = size;
      console.log(`📦 Generating ${base}x${base}@2x.png (${retina}x${retina})...`);
      await sharp(svgBuffer)
        .resize(retina, retina)
        .png()
        .toFile(path.join(iconsDir, `${base}x${base}@2x.png`));
    } else {
      console.log(`📦 Generating ${size}x${size}.png...`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `${size}x${size}.png`));
    }
  }

  // Generate Windows square icons
  for (const size of windowsSizes) {
    console.log(`📦 Generating Square${size}x${size}Logo.png...`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `Square${size}x${size}Logo.png`));
  }

  // Generate StoreLogo (50x50)
  console.log('📦 Generating StoreLogo.png...');
  await sharp(svgBuffer).resize(50, 50).png().toFile(path.join(iconsDir, 'StoreLogo.png'));

  console.log('✅ All PNG icons generated!');
  console.log('');
  console.log('📝 Note: For .ico and .icns files, you need to use:');
  console.log('   - icotool (Linux) or icoconvert (Windows) for .ico');
  console.log('   - iconutil (macOS) for .icns');
  console.log('   Or use online converters with the generated PNGs.');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
