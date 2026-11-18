// Genera las fotos responsive que consume src/app/core/photo-loader.ts:
//   images/fotos/<nombre>.jpeg  →  public/fotos/<nombre>-<ancho>.webp
// Un archivo por cada ancho de WIDTHS, aunque el original sea más angosto
// (no se agranda: el loader asume que el archivo existe siempre).
//
// Además genera portadas recortadas a 4:3 (centro, igual que object-fit: cover) para la galería:
//   public/fotos/portadas/<nombre>-<ancho>.webp   (ngSrc="portadas/<nombre>")
//
// Uso: npm run images            (solo regenera lo que cambió)
//      npm run images -- --force (regenera todo)

import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC_DIR = join(ROOT, 'images/fotos');
const OUT_DIR = join(ROOT, 'public/fotos');
const COVER_DIR = join(OUT_DIR, 'portadas');

/** Debe coincidir con PHOTO_WIDTHS de src/app/core/photo-loader.ts */
const WIDTHS = [480, 768, 1080, 1600];
/** Debe coincidir con el ngSrcset de room-gallery.ts */
const COVER_WIDTHS = [480, 768, 1080];
const COVER_RATIO = 4 / 3;

const WEBP = { quality: 72, effort: 6, smartSubsample: true };

const force = process.argv.includes('--force');

const mtime = async (file) => {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return 0;
  }
};

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  await mkdir(COVER_DIR, { recursive: true });

  const sources = (await readdir(SRC_DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  if (sources.length === 0) throw new Error(`No hay imágenes en ${SRC_DIR}`);

  const expected = new Set();
  const expectedCovers = new Set();
  let written = 0;
  let skipped = 0;
  let total = 0;

  for (const file of sources) {
    const name = basename(file, extname(file));
    const input = join(SRC_DIR, file);
    const inputMtime = await mtime(input);

    // Ancho real de salida (orientación EXIF aplicada). Si el original es más angosto
    // que varios anchos pedidos, se codifica una sola vez y se copia al resto.
    const meta = await sharp(input).autoOrient().metadata();
    const encoded = new Map(); // ancho efectivo → Promise<Buffer>

    const jobs = WIDTHS.map(async (width) => {
      const out = join(OUT_DIR, `${name}-${width}.webp`);
      expected.add(basename(out));

      if (!force && (await mtime(out)) > inputMtime) {
        const { size } = await stat(out); // (no `total += await …`: leería `total` antes del await)
        skipped++;
        total += size;
        return null;
      }

      const effective = Math.min(width, meta.width);
      if (!encoded.has(effective)) {
        encoded.set(
          effective,
          sharp(input)
            .autoOrient() // aplica EXIF orientation; la metadata se descarta (default de sharp)
            .resize({ width: effective, withoutEnlargement: true })
            .webp(WEBP)
            .toBuffer({ resolveWithObject: true }),
        );
      }
      const { data, info } = await encoded.get(effective);
      await writeFile(out, data);

      written++;
      total += data.length;
      return `${width}→${info.width}×${info.height} ${kb(data.length)}`;
    });

    // Portada 4:3: recorte centrado del original y después resize por ancho (sin agrandar).
    const cropW = Math.min(meta.width, Math.round(meta.height * COVER_RATIO));
    const cropH = Math.min(meta.height, Math.round(meta.width / COVER_RATIO));
    const crop = {
      left: Math.floor((meta.width - cropW) / 2),
      top: Math.floor((meta.height - cropH) / 2),
      width: cropW,
      height: cropH,
    };
    const encodedCovers = new Map();

    const coverJobs = COVER_WIDTHS.map(async (width) => {
      const out = join(COVER_DIR, `${name}-${width}.webp`);
      expectedCovers.add(basename(out));

      if (!force && (await mtime(out)) > inputMtime) {
        const { size } = await stat(out);
        skipped++;
        total += size;
        return null;
      }

      const effective = Math.min(width, cropW);
      if (!encodedCovers.has(effective)) {
        encodedCovers.set(
          effective,
          sharp(input)
            .autoOrient()
            .extract(crop)
            .resize({ width: effective, withoutEnlargement: true })
            .webp(WEBP)
            .toBuffer({ resolveWithObject: true }),
        );
      }
      const { data, info } = await encodedCovers.get(effective);
      await writeFile(out, data);

      written++;
      total += data.length;
      return `portada ${width}→${info.width}×${info.height} ${kb(data.length)}`;
    });

    const results = (await Promise.all([...jobs, ...coverJobs])).filter(Boolean);
    if (results.length) console.log(`${name.padEnd(16)} ${results.join(' · ')}`);
  }

  for (const file of await readdir(COVER_DIR)) {
    if (file.endsWith('.webp') && !expectedCovers.has(file)) {
      await unlink(join(COVER_DIR, file));
      console.log(`borrado (huérfano): portadas/${file}`);
    }
  }

  // Borra variantes de fotos que ya no existen en images/fotos.
  for (const file of await readdir(OUT_DIR)) {
    if (file.endsWith('.webp') && !expected.has(file)) {
      await unlink(join(OUT_DIR, file));
      console.log(`borrado (huérfano): ${file}`);
    }
  }

  console.log(
    `\n${sources.length} fotos · ${written} generadas · ${skipped} sin cambios · total public/fotos: ${kb(total)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
