import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'public/newhabitwizard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

async function optimize() {
  for (const file of files) {
    const filePath = path.join(dir, file);
    const outPath = path.join(dir, file.replace('.png', '.webp'));
    await sharp(filePath)
      .resize(128, 128, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(outPath);
    console.log(`Optimized ${file} to WebP`);
    // Remove the large pngs
    fs.unlinkSync(filePath);
  }
}

optimize().catch(console.error);
