import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import compression from 'compression';
import express from 'express';
import { basename, join, relative, sep } from 'node:path';
import { constants as zlib } from 'node:zlib';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// No anunciar el framework del server; y que el browser respete el Content-Type declarado.
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

/**
 * Políticas de caché:
 * - Archivos del build con hash en el nombre (main-ABCD1234.js, media/…-ABCD1234.woff2):
 *   nunca cambian de contenido → caché de 1 año, `immutable`.
 * - Fotos, imagen OG, íconos y manifest (public/, sin hash): 30 días.
 * - HTML (página prerenderizada / SSR): siempre se revalida (ETag → 304 barato),
 *   así un cambio de precio o de texto se ve en el próximo deploy.
 */
const CACHE_IMMUTABLE = 'public, max-age=31536000, immutable';
const CACHE_30_DAYS = 'public, max-age=2592000';
const CACHE_1_DAY = 'public, max-age=86400';
const CACHE_HTML = 'public, max-age=0, must-revalidate';

/** Hash de esbuild: 8 caracteres base32 en mayúsculas antes de la extensión. */
const HASHED_FILE = /-[A-Z0-9]{8}\.[a-z0-9]+$/;
const PUBLIC_ASSET_DIRS = ['fotos', 'og'];
const PUBLIC_ASSET_FILE =
  /^(favicon\.(svg|ico)|apple-touch-icon\.png|icon-\d+\.png|site\.webmanifest)$/;

const cacheControlFor = (filePath: string): string => {
  const rel = relative(browserDistFolder, filePath);
  const name = basename(rel);

  if (name.endsWith('.html')) return CACHE_HTML;
  if (PUBLIC_ASSET_DIRS.includes(rel.split(sep)[0]) || PUBLIC_ASSET_FILE.test(name))
    return CACHE_30_DAYS;
  if (HASHED_FILE.test(name)) return CACHE_IMMUTABLE;
  return CACHE_1_DAY; // robots.txt, sitemap.xml, etc.
};

/**
 * gzip / brotli para respuestas de texto (HTML, JS, CSS, SVG, JSON, XML).
 * Las imágenes (webp/jpg/png) ya vienen comprimidas y el filtro por defecto las saltea.
 * Brotli calidad 6: ~5% menos que gzip en ~5 ms por archivo (la 4 por defecto pesa igual que gzip).
 */
app.use(compression({ brotli: { params: { [zlib.BROTLI_PARAM_QUALITY]: 6 } } }));

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    cacheControl: false,
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', cacheControlFor(filePath));
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 * La landing prerenderizada (index.html) también sale por acá, no por express.static
 * (`index: false`), así que el Cache-Control del HTML se aplica en este punto.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (!response) return next();
      // Default para el HTML; si una ServerRoute define su propio Cache-Control, lo pisa.
      res.setHeader('Cache-Control', CACHE_HTML);
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
