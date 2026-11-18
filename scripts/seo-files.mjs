// Archivos que dependen de src/app/data/casa.ts:
//   public/robots.txt, public/sitemap.xml (SITE_URL), public/site.webmanifest (barrio)
//   y angular.json → security.allowedHosts (host de SITE_URL + localhost).
// Correr después de cambiar el dominio o el barrio: npm run seo-files

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CASA, SITE_URL } from './casa-data.mjs';

const PUBLIC = new URL('../public/', import.meta.url).pathname;

if (!/^https:\/\/[^/]+$/.test(SITE_URL)) {
  throw new Error(`SITE_URL debe ser https://dominio sin ruta ni barra final (es "${SITE_URL}")`);
}
if (SITE_URL.includes('example.com')) {
  console.warn(
    `⚠ SITE_URL todavía es el placeholder (${SITE_URL}): cambiarlo en src/app/data/casa.ts`,
  );
}

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
  </url>
</urlset>
`;

const manifest = {
  name: `Casa en venta · ${CASA.barrio}`,
  short_name: `Casa ${CASA.barrio}`,
  lang: 'es',
  start_url: '/',
  scope: '/',
  display: 'browser',
  theme_color: '#071F33',
  background_color: '#F8FAFC',
  icons: [
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};

const files = {
  'robots.txt': robots,
  'sitemap.xml': sitemap,
  'site.webmanifest': `${JSON.stringify(manifest, null, 2)}\n`,
};

for (const [name, content] of Object.entries(files)) {
  await writeFile(join(PUBLIC, name), content);
  console.log(`public/${name}`);
}

// angular.json: el motor SSR solo atiende requests cuyo Host esté en allowedHosts.
// Se reemplaza solo ese array (sin reformatear el resto del archivo).
const ANGULAR_JSON = new URL('../angular.json', import.meta.url);
const host = new URL(SITE_URL).hostname;
// Con www.dominio también se acepta el dominio pelado (suele redirigir al mismo server).
const hosts = [...new Set(['localhost', host, host.replace(/^www\./, '')])];
const angularJson = await readFile(ANGULAR_JSON, 'utf8');
const ALLOWED_HOSTS = /("allowedHosts":\s*)\[[^\]]*\]/;
if (!ALLOWED_HOSTS.test(angularJson))
  throw new Error('angular.json no tiene security.allowedHosts');
const updated = angularJson.replace(
  ALLOWED_HOSTS,
  `$1${JSON.stringify(hosts).replaceAll(',', ', ')}`,
);
if (updated !== angularJson) await writeFile(ANGULAR_JSON, updated);
console.log(`angular.json allowedHosts: ${hosts.join(', ')}`);
