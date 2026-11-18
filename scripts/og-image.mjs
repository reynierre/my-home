// Genera la imagen Open Graph (preview al compartir en WhatsApp / Facebook / X):
// una captura del sitio real — header + hero completos — en 1200×630.
//
// Uso: npm run og   (hace `ng build`, levanta el server del build, captura y comprime)
//
// Como es una captura del build, la imagen siempre coincide con la página
// (precio, textos, fotos). Chrome: usa CHROME_PATH si está definido.

import { spawn } from 'node:child_process';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { OG_IMAGE_PATH } from './casa-data.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SERVER = join(ROOT, 'dist/my-home/server/server.mjs');
const OUT = join(ROOT, 'public', OG_IMAGE_PATH);
const DIST_OUT = join(ROOT, 'dist/my-home/browser', OG_IMAGE_PATH);

const WIDTH = 1200;
const HEIGHT = 630;
/** Aire bajo el hero (fondo slate-50), como en el diseño. */
const BOTTOM_GAP = 16;
/** Se captura al doble y se reduce con lanczos: texto y bordes más nítidos. */
const SCALE = 2;
const MAX_BYTES = 300 * 1024;
const PORT = 4399;

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

const findChrome = () => {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error('No se encontró Chrome. Definí CHROME_PATH.');
  return found;
};

const startServer = async () => {
  if (!existsSync(SERVER)) throw new Error('No existe el build. Corré `npm run build` primero.');
  const server = spawn(process.execPath, [SERVER], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });
  const url = `http://localhost:${PORT}/`;
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(url)).ok) return { server, url };
    } catch {
      // todavía arrancando
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  server.kill();
  throw new Error(`El server del build no respondió en ${url}`);
};

/** Espera fuentes y foto del hero, y desactiva transiciones/focus para una captura estable. */
const settle = async (page) => {
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const img = document.querySelector('[data-hero] img');
    if (img && !img.complete) await new Promise((r) => img.addEventListener('load', r, { once: true }));
    await img?.decode?.();
    document.activeElement?.blur?.();
  });
};

/** Borde inferior del recuadro del hero (no de la <section>). */
const heroBottom = (page) =>
  page.$eval('[data-hero] > div', (el) => el.getBoundingClientRect().bottom);

async function main() {
  const { server, url } = await startServer();
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ['--hide-scrollbars', '--force-color-profile=srgb'],
  });

  try {
    const page = await browser.newPage();

    // El alto del hero depende del viewport: min-height clamp(520px, 72vh, 640px).
    // Se mide dónde empieza y se elige el alto de viewport que lo hace terminar
    // justo en 630 - BOTTOM_GAP, así header + hero entran completos en la imagen.
    await page.setViewport({ width: WIDTH, height: 800, deviceScaleFactor: SCALE });
    await page.goto(url, { waitUntil: 'networkidle0' });
    const heroTop = await page.$eval('[data-hero] > div', (el) => el.getBoundingClientRect().top);
    const targetHeroHeight = HEIGHT - BOTTOM_GAP - heroTop;
    const viewportHeight = Math.ceil(targetHeroHeight / 0.72);

    await page.setViewport({ width: WIDTH, height: viewportHeight, deviceScaleFactor: SCALE });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await settle(page);

    const bottom = await heroBottom(page);
    if (bottom > HEIGHT) {
      throw new Error(`El hero termina en ${bottom}px y no entra en ${HEIGHT}px (¿contenido más alto?).`);
    }

    const png = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    const jpg = await sharp(png)
      .resize(WIDTH, HEIGHT, { kernel: 'lanczos3' })
      .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toBuffer();

    if (jpg.length > MAX_BYTES) {
      throw new Error(`La imagen pesa ${(jpg.length / 1024).toFixed(0)} KB (> ${MAX_BYTES / 1024} KB).`);
    }

    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(OUT, jpg);
    // También al build actual, así no hace falta recompilar para servirla.
    if (existsSync(dirname(dirname(DIST_OUT)))) {
      await mkdir(dirname(DIST_OUT), { recursive: true });
      await copyFile(OUT, DIST_OUT);
    }

    console.log(
      `OG: ${OG_IMAGE_PATH} · ${WIDTH}×${HEIGHT} · ${(jpg.length / 1024).toFixed(0)} KB` +
        ` · viewport ${WIDTH}×${viewportHeight} · hero ${Math.round(heroTop)}→${Math.round(bottom)}px`,
    );
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
