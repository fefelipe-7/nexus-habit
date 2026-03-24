import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const inputDir = './public/fred';
const outputDir = './public/fred';

async function convert() {
  try {
    const files = await fs.readdir(inputDir);
    const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

    for (const file of pngFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file.replace(/\.png$/i, '.webp'));
      
      console.log(`Converting ${inputPath} to ${outputPath}...`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
    }
    console.log('Conversion complete!');
  } catch (err) {
    console.error('Error during conversion:', err);
  }
}

convert();
