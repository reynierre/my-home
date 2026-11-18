# Casa en venta · Ortiz

Landing de una sola página para vender una casa de forma directa (sin inmobiliaria).
Hecha con **Angular 22** (standalone, signals, zoneless) + **SSR/SSG** (`@angular/ssr`) + **Tailwind CSS v4**.

## Requisitos

- Node **24 LTS** (`nvm use`, ver `.nvmrc`). Angular 22 no corre en Node ≤ 22.22.2.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo en http://localhost:4200 |
| `npm run build` | Build de producción + prerender del HTML en `dist/my-home` |
| `npm run serve:ssr:my-home` | Sirve el build (Express, compresión br/gzip, cache headers) en http://localhost:4000 |
| `npm run assets` | Regenera fotos optimizadas, imagen OG, `robots.txt` y `sitemap.xml` |
| `npm run images` | Solo fotos (`images/fotos/*.jpeg` → `public/fotos/*.webp` + portadas 4:3) |
| `npm run og` | Solo la imagen para compartir (`public/og/og-frente.jpg`, 1200×630, usa Chrome local) |
| `npm run seo-files` | `robots.txt`, `sitemap.xml`, manifest y `allowedHosts` desde `SITE_URL` |
| `npm run icons` | Favicons e íconos PWA |

## Cambiar contenido

Todo el contenido (precio, condición, teléfonos, WhatsApp, fotos por ambiente, preguntas frecuentes,
textos SEO) está en **`src/app/data/casa.ts`**. Después de cambiar precio/textos del hero correr
`npm run og` para que la vista previa al compartir el link quede igual.

Para agregar o cambiar fotos: poner el `.jpeg` en `images/fotos/`, agregar su nombre en el ambiente
correspondiente de `ROOM_DEFS` y correr `npm run images`.

## Antes de publicar

1. **Dominio:** reemplazar `SITE_URL` en `src/app/data/casa.ts` (hoy es `https://vendo-casa-ortiz.vercel.app`) y correr
   `npm run seo-files && npm run build`. Es necesario para que `og:image` y `canonical` sean URLs absolutas
   correctas (WhatsApp/Facebook no muestran la vista previa si no).
2. Confirmar con el dueño: número de WhatsApp, moneda, `tipoPlanta` y `equipada`.
3. Si se cambia la imagen OG después de haber compartido el link, versionarla
   (p. ej. `ogImage: '/og/og-frente.jpg?v=2'`): WhatsApp/Facebook la cachean por URL.

## Deploy

El build genera `dist/my-home/browser` (estático, con `index.html` prerenderizado) y
`dist/my-home/server/server.mjs` (Express). Se puede publicar:

- **Como sitio estático** (Firebase Hosting, Netlify, Cloudflare Pages, Vercel…): subir `dist/my-home/browser`.
- **Con Node**: `node dist/my-home/server/server.mjs` (variable `PORT`).

## Estructura

```
src/app/
  data/casa.ts              contenido de la casa (única fuente de verdad)
  core/                     LightboxStore, Seo, photo-loader, focus-trap, scroll-lock
  shared/icon/              íconos SVG inline (Lucide)
  pages/casa/casa-page.ts   compone las secciones y aplica SEO
  components/               site-header, hero (+ price-card), la-casa, room-gallery,
                            faq-accordion, contact-cta, mobile-sticky-bar, lightbox
scripts/                    generación de assets (sharp + Chrome headless)
images/fotos/               fotos originales
docs/design/                handoff y prototipo HTML de referencia
```

## Rendimiento y SEO

- HTML prerenderizado (SSG) con hidratación incremental y event replay (default en v22).
- Fotos WebP responsive vía `NgOptimizedImage` + loader propio; la del hero con `priority` (preload).
- Lightbox en un chunk aparte (`@defer`), precargado en idle.
- Fuentes self-hosted (Poppins/Mulish, subset latin).
- Title, description, canonical, Open Graph, Twitter Card y JSON-LD (`RealEstateListing`) en el HTML estático.
- La imagen OG reproduce el hero completo (foto, título, descripción y tarjeta de precio).
