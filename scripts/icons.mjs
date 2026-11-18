// Íconos del sitio a partir del logo del header (cuadrado azul marca + pin de Lucide):
//   public/favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180),
//   icon-192.png, icon-512.png (los que referencia public/site.webmanifest).
//
// Uso: npm run icons

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const PUBLIC = join(ROOT, 'public');

const BRAND_600 = '#045A9C';
/** Lucide `map-pin` (viewBox 24×24). */
const PIN = 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z';

/**
 * Lienzo 36×36 como el logo del header (radio 8). El pin va más grande que en el header
 * (24px vs 18px) para que se lea en la pestaña del navegador.
 * @param {{ radius?: number, pinSize?: number, stroke?: number }} opts
 *   radius 0 = cuadrado lleno (iOS redondea solo); stroke en unidades del ícono (24).
 */
const iconSvg = ({ radius = 8, pinSize = 24, stroke = 2 } = {}) => {
  const offset = (36 - pinSize) / 2;
  const scale = pinSize / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <rect width="36" height="36" rx="${radius}" fill="${BRAND_600}"/>
  <path d="${PIN}" transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="#fff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
};

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 36 })
    .resize(size, size)
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

/** Contenedor ICO mínimo con imágenes PNG embebidas (válido en todos los navegadores actuales). */
const ico = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: ícono
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // ancho
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // alto
    entry.writeUInt8(0, 2); // paleta
    entry.writeUInt8(0, 3); // reservado
    entry.writeUInt16LE(1, 4); // planos
    entry.writeUInt16LE(32, 6); // bits por pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
};

async function main() {
  const favicon = iconSvg();
  // iOS aplica su propia máscara redondeada y pinta de negro la transparencia: cuadrado lleno.
  const fullBleed = iconSvg({ radius: 0, pinSize: 20 });
  // A 16/32px un trazo de 2 queda en ~1px y se empasta: versión más gruesa para el .ico.
  const tiny = iconSvg({ pinSize: 26, stroke: 2.6 });

  const icoImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await png(size < 48 ? tiny : favicon, size) })),
  );

  const files = {
    'favicon.svg': favicon,
    'favicon.ico': ico(icoImages),
    'apple-touch-icon.png': await png(fullBleed, 180),
    'icon-192.png': await png(favicon, 192),
    'icon-512.png': await png(favicon, 512),
  };

  for (const [name, data] of Object.entries(files)) {
    await writeFile(join(PUBLIC, name), data);
    console.log(`public/${name.padEnd(22)} ${(Buffer.byteLength(data) / 1024).toFixed(1)} KB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
