import sharp from 'sharp';

const source = 'assets/src/notebook-bridge.png';
const base = () => sharp(source).extract({ left: 0, top: 0, width: 1536, height: 850 });

await Promise.all([
  base().resize(560, 310).webp({ quality: 76 }).toFile('public/assets/notebook-bridge-560.webp'),
  base().resize(960, 531).webp({ quality: 78 }).toFile('public/assets/notebook-bridge-960.webp'),
  base().resize(960, 531).avif({ quality: 52 }).toFile('public/assets/notebook-bridge-960.avif'),
  base().resize(960, 531).jpeg({ quality: 68, mozjpeg: true }).toFile('public/assets/notebook-bridge-960.jpg'),
]);
