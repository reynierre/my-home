// Genera la imagen Open Graph (preview al compartir en WhatsApp / Facebook / X):
// una réplica del hero (foto + degradé, badges, H1, subtítulo y tarjeta de precio)
// en 1200×630, renderizada con Google Chrome headless y comprimida con mozjpeg.
//
// Uso: npm run og
// Chrome: usa CHROME_PATH si está definido; si no, busca las rutas habituales.
//
// Los textos salen de src/app/data/casa.ts (precio, barrio, condición, tipo de planta)
// y la ruta de salida de SEO.ogImage, así la imagen no queda desactualizada.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { CASA, OG_IMAGE_PATH } from './casa-data.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'public', OG_IMAGE_PATH);

const WIDTH = 1200;
const HEIGHT = 630;
/** Se renderiza al doble y se reduce con lanczos: texto y bordes más nítidos. */
const SCALE = 2;
const MAX_BYTES = 300 * 1024;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

/** Misma lógica que el hero: la foto del frente recorta cielo/cables; una interior va más clara. */
const HERO_LOOK =
  CASA.heroFoto === 'frente'
    ? {
        position: 'center 85%',
        overlay:
          'linear-gradient(180deg, rgba(7,31,51,0.35) 0%, rgba(7,31,51,0.55) 45%, rgba(7,31,51,0.94) 100%)',
      }
    : {
        position: 'center 55%',
        overlay: 'linear-gradient(180deg, rgba(7,31,51,0.05) 25%, rgba(7,31,51,0.85) 100%)',
      };

/** Grilla de datos de la tarjeta de precio (igual que el hero). `null` = ícono check. */
const FACTS = [
  ['4', 'Dormitorios'],
  ['1', 'Baño'],
  ['2', 'Cocinas'],
  ['100 m²', 'Construidos'],
  ['24 m²', 'Patio'],
  [null, 'Papeles al día'],
];

const ICON_WHATSAPP =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>';
const ICON_CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

const dataUri = async (file, mime) =>
  `data:${mime};base64,${(await readFile(join(ROOT, file))).toString('base64')}`;

async function buildHtml() {
  const [photo, poppins600, poppins700, poppins800, mulish] = await Promise.all([
    dataUri(`images/fotos/${CASA.heroFoto}.jpeg`, 'image/jpeg'),
    dataUri('node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2', 'font/woff2'),
    dataUri('node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2', 'font/woff2'),
    dataUri('node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2', 'font/woff2'),
    dataUri(
      'node_modules/@fontsource-variable/mulish/files/mulish-latin-wght-normal.woff2',
      'font/woff2',
    ),
  ]);

  const facts = FACTS.map(
    ([value, label]) => `
        <div class="fact">
          ${value === null ? `<span class="fact-check">${ICON_CHECK}</span>` : `<span class="fact-value">${esc(value)}</span>`}
          <span class="fact-label">${esc(label)}</span>
        </div>`,
  ).join('');

  return /* html */ `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family: 'Poppins'; font-weight: 600; src: url(${poppins600}) format('woff2'); }
  @font-face { font-family: 'Poppins'; font-weight: 700; src: url(${poppins700}) format('woff2'); }
  @font-face { font-family: 'Poppins'; font-weight: 800; src: url(${poppins800}) format('woff2'); }
  @font-face { font-family: 'Mulish'; font-weight: 200 1000; src: url(${mulish}) format('woff2'); }

  :root {
    --brand-50: #EBF3FB; --brand-600: #045A9C; --brand-700: #064B80; --brand-950: #071F33;
    --lime-50: #F4FCE3; --lime-500: #8CD40B;
    --slate-200: #E2E8F0; --slate-400: #94A3B8; --slate-500: #64748B; --slate-700: #334155; --slate-900: #0F172A;
    --success-500: #16A34A; --wa: #1E9E4F;
    --display: 'Poppins', sans-serif;
    --body: 'Mulish', sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    background: var(--brand-950); color: var(--slate-700);
    font-family: var(--body); -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision;
  }

  .hero {
    position: relative; width: 100%; height: 100%;
    display: flex; align-items: flex-end; gap: 40px;
    padding: 50px 96px;
  }
  .photo {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: ${HERO_LOOK.position};
    filter: brightness(1.05) contrast(1.05);
  }
  .overlay { position: absolute; inset: 0; background: ${HERO_LOOK.overlay}; }

  /* Bloque de texto (abajo a la izquierda) */
  .copy {
    position: relative; flex: 1 1 0; min-width: 0;
    display: flex; flex-direction: column; gap: 18px; color: #fff;
    padding-bottom: 6px;
  }
  .badges { display: flex; flex-wrap: wrap; gap: 10px; }
  .badge {
    display: inline-flex; align-items: center;
    font-family: var(--display); font-weight: 700; font-size: 15px; letter-spacing: 0.03em; line-height: 1;
    padding: 7px 13px; border-radius: 999px;
  }
  .badge-sale { background: var(--lime-50); color: var(--lime-500); }
  .badge-soft { background: var(--brand-50); color: var(--brand-700); }
  h1 {
    margin: 0; font-family: var(--display); font-weight: 800;
    font-size: 60px; line-height: 1.06; letter-spacing: -0.01em; text-wrap: balance;
    text-shadow: 0 2px 18px rgba(7, 31, 51, 0.35);
  }
  .lead { margin: 0; font-size: 25px; line-height: 1.4; font-weight: 500; text-wrap: balance; }

  /* Tarjeta de precio (derecha) */
  .card {
    position: relative; flex: 0 0 424px;
    background: #fff; border-radius: 18px; padding: 26px;
    display: flex; flex-direction: column; gap: 18px;
    box-shadow: 0 16px 40px rgba(27, 22, 19, 0.14);
  }
  .price-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
  .price { display: flex; flex-direction: column; gap: 3px; }
  .price-label { font-size: 13px; font-weight: 700; letter-spacing: 0.14em; color: var(--slate-500); }
  .price-value { font-family: var(--display); font-weight: 800; font-size: 42px; line-height: 1.1; color: var(--slate-900); }
  .chip {
    padding: 7px 15px; border-radius: 999px; margin-bottom: 6px;
    background: var(--lime-500); color: var(--brand-950);
    font-size: 15px; font-weight: 800; letter-spacing: 0.04em; line-height: 1.2;
  }
  .facts {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px;
    background: var(--slate-200); border: 1px solid var(--slate-200); border-radius: 10px; overflow: hidden;
  }
  .fact { background: #fff; padding: 10px 15px; display: flex; flex-direction: column; gap: 1px; }
  .fact-value { font-family: var(--display); font-weight: 700; font-size: 24px; line-height: 1.4; color: var(--brand-600); }
  .fact-check { height: 33.6px; display: flex; align-items: center; color: var(--success-500); }
  .fact-check svg { width: 27px; height: 27px; }
  .fact-label { font-size: 16px; line-height: 1.3; color: var(--slate-700); }
  .ctas { display: flex; flex-direction: column; gap: 9px; }
  .btn {
    display: flex; align-items: center; justify-content: center; gap: 11px; border-radius: 9px;
    font-family: var(--display); font-weight: 600;
  }
  .btn-wa { height: 56px; background: var(--wa); color: #fff; font-size: 18px; }
  .btn-wa svg { width: 23px; height: 23px; }
  .btn-ghost { height: 46px; border: 1px solid var(--slate-400); color: var(--slate-900); font-size: 17px; }
</style>
</head>
<body>
  <div class="hero">
    <img class="photo" src="${photo}" alt="">
    <div class="overlay"></div>

    <div class="copy">
      <div class="badges">
        <span class="badge badge-sale">EN VENTA</span>
        <span class="badge badge-soft">${esc(CASA.tipoPlanta.toUpperCase())}</span>
      </div>
      <h1>4 dormitorios con ampliación&nbsp;—&nbsp;${esc(CASA.barrio)}</h1>
      <p class="lead">Venta directa del propietario, sin comisión inmobiliaria.</p>
    </div>

    <div class="card">
      <div class="price-row">
        <div class="price">
          <span class="price-label">PRECIO</span>
          <span class="price-value">${esc(CASA.precio)}</span>
        </div>
        <span class="chip">${esc(CASA.condicion)}</span>
      </div>
      <div class="facts">${facts}
      </div>
      <div class="ctas">
        <div class="btn btn-wa">${ICON_WHATSAPP}<span>Escribir por WhatsApp</span></div>
        <div class="btn btn-ghost">Ver fotos</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!executablePath) {
    throw new Error('No se encontró Google Chrome. Definí CHROME_PATH con la ruta del ejecutable.');
  }

  const html = await buildHtml();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--font-render-hinting=none',
    ],
  });

  let png;
  let h1Size;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    // Falla en voz alta si alguna fuente no cargó (evita una imagen con tipografía del sistema).
    const missing = await page.evaluate(() =>
      [
        '600 20px Poppins',
        '700 20px Poppins',
        '800 20px Poppins',
        '500 20px Mulish',
        '800 20px Mulish',
      ].filter((f) => !document.fonts.check(f)),
    );
    const loaded = await page.evaluate(() =>
      [...document.fonts]
        .filter((f) => f.status === 'loaded')
        .map((f) => `${f.family} ${f.weight}`),
    );
    if (missing.length || loaded.length < 4) {
      throw new Error(
        `Fuentes sin cargar: ${missing.join(', ') || '?'} (cargadas: ${loaded.join(', ')})`,
      );
    }

    // H1 lo más grande posible (60px → 46px) sin desbordar la columna de texto:
    // así un barrio con nombre más largo sigue entrando en dos líneas.
    h1Size = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const copyRight = () => document.querySelector('.copy').getBoundingClientRect().right;
      const range = document.createRange();
      range.selectNodeContents(h1);
      for (let size = 60; size >= 46; size--) {
        h1.style.fontSize = `${size}px`;
        if (range.getBoundingClientRect().right <= copyRight() + 0.5) return size;
      }
      return null;
    });
    if (!h1Size) throw new Error('El H1 no entra en la columna de texto ni a 46px.');

    // Que nada se salga del lienzo (p. ej. un precio más largo que rompa la tarjeta).
    const overflow = await page.evaluate(() =>
      ['.card', '.copy'].some((sel) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth;
      }),
    );
    if (overflow) throw new Error('El contenido no entra en 1200×630: revisar textos o tamaños.');

    png = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
  } finally {
    await browser.close();
  }

  await mkdir(dirname(OUT), { recursive: true });

  const encode = (quality) =>
    sharp(png)
      .resize(WIDTH, HEIGHT, { kernel: 'lanczos3' })
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toBuffer();

  // Máxima calidad que entre en el presupuesto de peso.
  let quality = 86;
  let jpg = await encode(quality);
  while (jpg.length > MAX_BYTES && quality > 60) {
    quality -= 4;
    jpg = await encode(quality);
  }
  if (jpg.length > MAX_BYTES)
    throw new Error(`La imagen pesa ${jpg.length} bytes (máximo ${MAX_BYTES}).`);
  await writeFile(OUT, jpg);

  const meta = await sharp(OUT).metadata();
  console.log(
    `${OUT.replace(ROOT, '')}: ${meta.width}×${meta.height} JPEG q${quality} · ${(jpg.length / 1024).toFixed(1)} KB · H1 ${h1Size}px`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
