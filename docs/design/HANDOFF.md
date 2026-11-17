# Handoff: Landing "Casa en Venta" (Ortiz)

## Overview
Landing page de una sola página para vender una casa de forma particular (dueño directo, sin inmobiliaria). Objetivo comercial: que el visitante (mayoría desde celular) entienda la propuesta en 5 segundos y escriba por WhatsApp.

**Stack objetivo:** Angular (última versión estable, standalone components, signals) con **SSR** (`@angular/ssr`) y **Tailwind CSS v4**.

## About the Design Files
Los archivos de este paquete son **referencias de diseño hechas en HTML**: prototipos que muestran el aspecto y el comportamiento esperados. No son código de producción para copiar. La tarea es **recrear este diseño en Angular + SSR + Tailwind v4** siguiendo los patrones de Angular. `design/Casa en Venta.dc.html` abre directo en el navegador (con `support.js` y `_ds/` al lado) para comparar en vivo.

## Fidelity
**Alta fidelidad (hi-fi).** Colores, tipografía, espaciados, textos e interacciones son finales. Replicar pixel-perfect. Todos los textos van **verbatim** (español rioplatense con voseo).

---

## Arquitectura sugerida (Angular)

```
src/app/
  app.config.ts / app.config.server.ts   (provideClientHydration(withEventReplay()))
  data/casa.ts                            (datos de la casa + ROOMS/PHOTOS, ver abajo)
  pages/casa/casa.page.ts                 (compone las secciones, setea SEO)
  components/
    site-header/          header sticky
    hero/                 hero + tarjeta de precio
    la-casa/              texto + 4 highlights
    room-gallery/         tarjetas por ambiente (grid desktop / carrusel mobile)
    faq-accordion/        5 preguntas
    contact-cta/          bloque de contacto
    mobile-sticky-bar/    barra fija inferior (solo mobile)
    lightbox/             visor de fotos (overlay)
    icon/                 íconos SVG inline (Lucide, stroke 1.75)
  services/lightbox.service.ts            (signal con índice abierto o null)
public/fotos/*.jpeg
```

**SSR:** toda lógica con `window` (resize, scroll, keydown, touch) debe ir dentro de `afterNextRender()` o protegida con `isPlatformBrowser`. El HTML del servidor debe renderizar la versión desktop/fluida completa; el comportamiento mobile se resuelve **con CSS (breakpoints de Tailwind)** siempre que se pueda, no con JS, para evitar saltos en la hidratación. Solo la barra fija inferior necesita JS (IntersectionObserver sobre el hero).

**SEO:** usar `Title` y `Meta` de `@angular/platform-browser` en la página (se renderizan en SSR, que es lo que leen WhatsApp/Facebook al compartir). `og:image` debe ser **URL absoluta** del dominio final.

**Imágenes:** `NgOptimizedImage` (`ngSrc`), con `priority` en la foto del hero; el resto lazy.

---

## Design Tokens (Tailwind v4 `@theme`)

Pegar en `src/styles.css`:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Mulish:wght@400;500;600;700&display=swap');

@theme {
  --font-display: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-body: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --color-brand-50: #EBF3FB;
  --color-brand-600: #045A9C;   /* azul marca: eyebrows, links, números */
  --color-brand-700: #064B80;   /* hover links */
  --color-brand-950: #071F33;   /* fondo hero (fallback), bloque contacto, lightbox */
  --color-lime-500: #8CD40B;    /* chip "Negociable", eyebrow CONTACTO */
  --color-lime-50: #F4FCE3;

  --color-slate-50: #F8FAFC;    /* fondo página */
  --color-slate-100: #F1F5F9;   /* hover botón secundario */
  --color-slate-200: #E2E8F0;   /* bordes */
  --color-slate-400: #94A3B8;   /* borde botón secundario */
  --color-slate-500: #64748B;   /* texto muted */
  --color-slate-700: #334155;   /* texto body */
  --color-slate-900: #0F172A;   /* texto fuerte */
  --color-success-500: #16A34A; /* check "Papeles al día" */

  --color-wa: #1E9E4F;          /* WhatsApp (botones) */
  --color-wa-hover: #178A43;

  --radius-md: 8px;   /* cards, botones */
  --radius-lg: 14px;  /* hero, bloque contacto, tarjeta precio */

  --shadow-sm: 0 2px 6px rgba(27,22,19,0.08);
  --shadow-md: 0 6px 18px rgba(27,22,19,0.10);
  --shadow-lg: 0 16px 40px rgba(27,22,19,0.14);

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}

html { scroll-behavior: smooth; }
body { margin: 0; background: var(--color-slate-50); color: var(--color-slate-700); font-family: var(--font-body); }
a { color: var(--color-brand-600); text-decoration: none; }
a:hover { color: var(--color-brand-700); }
```

**Tipografía**
- Display/UI: Poppins. Body: Mulish.
- Eyebrows: 12px, weight 700, letter-spacing 0.14em, MAYÚSCULAS, color brand-600 (en contacto: lime-500).
- H1 hero: Poppins 800, `clamp(30px, 4.4vw, 54px)`, line-height 1.06, letter-spacing -0.01em, `text-wrap: balance`, blanco.
- H2 secciones: Poppins 700, `clamp(26px, 3vw, 32px)`, line-height 1.15, slate-900. (Contacto: `clamp(28px,3.2vw,36px)`, blanco.)
- Body: 17px / 1.65 en "La casa"; 16px / 1.6 en FAQ.

**Layout general:** contenedor `max-width: 1280px; margin: 0 auto;` padding horizontal `clamp(16px, 3vw, 32px)` (hero y contacto: `clamp(12px,3vw,32px)`). Separación vertical entre secciones: `padding-top: clamp(48px, 6vw, 72px)`. **Breakpoint mobile: < 760px** (en Tailwind definir `--breakpoint-md: 760px` o usar `max-[759px]:`).

---

## Datos (src/app/data/casa.ts)

```ts
export const CASA = {
  barrio: 'Ortiz',
  precio: 'US$ 12.500',
  condicion: 'Negociable',            // o 'Precio final'
  tipoPlanta: 'Planta alta con entrada independiente', // o 'Casa de 2 plantas'
  entradaIndependiente: true,         // = tipoPlanta incluye "independiente"
  equipada: false,                    // muestra chip "Se vende equipada" y cambia respuesta FAQ
  whatsapp: '59895861842',            // ⚠ confirmar con el dueño
  telefonos: ['+53 33205312', '+53 58281173'],
  heroFoto: 'frente',
};

export const ROOMS: [string, string[]][] = [
  ['Dormitorio con ampliación', ['cuarto-ampl-2', 'cuarto-ampl-3', 'cuarto-ampl-1']],
  ['Sala', ['sala-1']],
  ['Comedor', ['comedor-1']],
  ['Cocina interior', ['cocina-int-2', 'cocina-int-1']],
  ['Dormitorio del frente', ['cuarto-frente-2', 'cuarto-frente-1']],
  ['Dormitorio del medio', ['cuarto-medio-2', 'cuarto-medio-1', 'cuarto-medio-3']],
  ['Cocina exterior', ['cocina-ext-2', 'cocina-ext-1']],
  ['Baño', ['bano-1', 'bano-2', 'bano-3']],
  ['Frente', ['frente']],
];
// PHOTOS = lista plana en ese orden → 18 fotos: { src: `/fotos/${f}.jpeg`, room }
```

**Link WhatsApp:** `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, vi la casa en venta en Ortiz y me interesa coordinar una visita.')}` — abre en `target="_blank" rel="noopener"`.

---

## Screens / Secciones (en orden)

### 1. Header (sticky)
- `position: sticky; top: 0; z-index: 20;` fondo `rgba(255,255,255,0.95)` + `backdrop-filter: blur(8px)`, borde inferior 1px slate-200.
- Interior: contenedor 1280, padding `12px clamp(16px,3vw,32px)`, flex space-between, gap 16.
- **Izquierda:** cuadrado 36×36, radius 8, fondo brand-600, ícono `mapPin` 18px blanco. Al lado, columna: "Casa en venta" (Poppins 700, 15px, slate-900) y "Ortiz · Dueño directo" (12px, slate-500).
- **Derecha:** links "La casa" (#la-casa), "Fotos" (#fotos), "Preguntas" (#preguntas) — 14px, 600, slate-700, gap 26px, **ocultos en mobile**. Botón WhatsApp: alto 38, padding 0 14, radius 8, fondo `#1E9E4F` (hover `#178A43`), texto blanco 14px 700, ícono WhatsApp 18px + "WhatsApp".

### 2. Hero
- Sección: contenedor 1280, padding `clamp(12px,2.4vw,28px) clamp(12px,3vw,32px) 0`.
- Caja: `position: relative; border-radius: 14px; overflow: hidden; min-height: clamp(520px, 72vh, 640px); box-shadow: shadow-md; background: brand-950;` `display:flex; flex-wrap:wrap; align-items:flex-end; align-content:flex-end; gap:24px; padding: clamp(18px,3vw,36px)`.
- **Foto de fondo** (`/fotos/frente.jpeg`): absolute inset 0, `object-fit: cover; object-position: center 85%` (recorta cielo y cables), `filter: brightness(1.05) contrast(1.05)`, `cursor: zoom-in`. Click → abre lightbox en la foto "Frente".
- **Overlay:** absolute inset 0, `linear-gradient(180deg, rgba(7,31,51,0.35) 0%, rgba(7,31,51,0.55) 45%, rgba(7,31,51,0.94) 100%)`, pointer-events none.
  - (Si se usa foto interior: `object-position: center 55%` y overlay `linear-gradient(180deg, rgba(7,31,51,0.05) 25%, rgba(7,31,51,0.85) 100%)`.)
- **Bloque de texto** (relative, `flex: 1 1 380px; max-width: 640px;` columna gap 14, blanco, pointer-events none):
  - Badges (pill, Poppins 700, 11px, padding 4px 10px, letter-spacing 0.03em, line-height 1): "EN VENTA" (fondo #F4FCE3, texto #8CD40B) y "PLANTA ALTA CON ENTRADA INDEPENDIENTE" (fondo #EBF3FB, texto #064B80). Gap 8, wrap.
  - H1: "4 dormitorios con ampliación — Ortiz".
  - Subtítulo: "Venta directa del propietario, sin comisión inmobiliaria." — `clamp(16px,1.5vw,18px)`, lh 1.5, blanco.
- **Tarjeta de precio** (relative, `margin-left: auto; flex: 0 1 360px; min-width: min(100%, 290px);` fondo blanco, radius 14, padding 22, shadow-lg, columna gap 16). En pantallas angostas baja debajo del texto (lo hace el flex-wrap).
  - Fila: izquierda "PRECIO" (11px, 700, ls 0.14em, slate-500) + "US$ 12.500" (Poppins 800, 30px, lh 1.1, slate-900). Derecha chip "Negociable" (pill, padding 5px 12px, fondo lime-500, texto brand-950, 12px 800, ls 0.04em).
  - **Grilla 2×3** de datos: `grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1px; background: slate-200; border: 1px solid slate-200; border-radius: 8px; overflow: hidden;` Cada celda: fondo blanco, padding 10px 12px, valor Poppins 700 19px brand-600 + etiqueta 13px:
    1. 4 · Dormitorios
    2. 1 · Baño
    3. 2 · Cocinas
    4. 100 m² · Construidos
    5. 24 m² · Patio
    6. ✓ (ícono check 22px, stroke 2.4, success-500, contenedor alto 28) · Papeles al día
  - CTAs (columna, gap 8):
    - Primario: link WhatsApp, alto 50, radius 8, fondo #1E9E4F (hover #178A43, transición 150ms), Poppins 600 16px blanco, ícono 20px + "Escribir por WhatsApp".
    - Secundario: botón "Ver fotos", ancho completo, padding 12px 22px, fondo transparente, borde 1px slate-400, texto slate-900 Poppins 600 15px, radius 8, hover fondo slate-100, active `translateY(1px)`. Click → lightbox en foto 1.

### 3. La casa (`#la-casa`)
- Grid `repeat(auto-fit, minmax(min(100%,380px), 1fr))`, gap `clamp(28px,4vw,56px)`, align start.
- Columna texto (gap 12): eyebrow "LA CASA"; H2 "Espacio para toda la familia, lista para entrar a vivir"; párrafo:
  > Casa de 4 dormitorios con una ampliación ya terminada que suma un dormitorio amplio con placard. La distribución separa la zona social (sala, comedor y cocina interior) de los dormitorios, y la cocina exterior resuelve el uso diario y las reuniones. Planta alta con acceso propio por escalera. Ambientes con ventanas y buena luz natural. A pocas cuadras del micro Ortiz.
- Columna highlights: grid 2 columnas, gap 12. Cada card: fondo blanco, borde 1px slate-200, radius 8, padding 18, columna gap 12. Círculo 40×40 fondo brand-50 con ícono 20px brand-600 (stroke 1.75) + título Poppins 600 15px slate-900.
  1. Ícono casa con "+" (Lucide `house-plus`) — "Ampliación terminada"
  2. Ícono cubiertos (Lucide `utensils`) — "Cocina interior + exterior"
  3. Ícono puerta abierta (Lucide `door-open`) — "Entrada independiente" *(solo si `entradaIndependiente`)*
  4. Ícono camión (Lucide `truck`) — "Lista para mudarse"

### 4. Fotos (`#fotos`)
- Columna gap 22.
- Encabezado (flex space-between, wrap): eyebrow "FOTOS · 18" + H2 "Recorré la casa por ambiente". A la derecha, si `equipada`: chip "Se vende equipada" (pill, padding 7px 14px, fondo blanco, borde 1px brand-600, texto brand-600 13px 700, ícono check 16px).
- **Tarjetas por ambiente** (9, en el orden de `ROOMS`):
  - Desktop: flex wrap, gap 20, cada tarjeta `flex: 0 1 calc((100% - 40px) / 3)` → 3 por fila.
  - Mobile (<760px): **carrusel horizontal** — `flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory;` tarjetas `flex: 0 0 78%; scroll-snap-align: start;` padding inferior 12 para la scrollbar.
  - Tarjeta (botón): fondo blanco, borde 1px slate-200, radius 8, overflow hidden, shadow-sm; hover `translateY(-2px)` + shadow-md (200ms).
  - Imagen: contenedor `aspect-ratio: 4/3`, `object-fit: cover`, `filter: brightness(1.05) contrast(1.05)`, hover `scale(1.05)` (380ms). Usa la primera foto del ambiente como portada.
  - Pie: padding 14px 16px, nombre (Poppins 600 15px slate-900) + "N fotos" / "1 foto" (13px slate-500); a la derecha chevron 18px brand-600.
  - Click → abre lightbox en la primera foto de ese ambiente.

### 5. Preguntas frecuentes (`#preguntas`)
- `max-width: 880px`. Eyebrow "PREGUNTAS FRECUENTES", H2 "Lo que todos preguntan".
- Acordeón: contenedor blanco, borde 1px slate-200, radius 8; items separados por borde slate-200. **Solo uno abierto a la vez** (abrir otro cierra el anterior; click en el abierto lo cierra). Todos cerrados al inicio.
- Botón: padding 18px 20px, flex space-between, Poppins 600 16px slate-900; chevronDown 18px brand-600 que rota 180° al abrir (200ms). Respuesta: padding `0 20px 18px`, lh 1.6. Usar `aria-expanded`.
- Contenido:
  1. **¿Los papeles están al día?** — Sí. La documentación está al día y la podés revisar con tu escribano antes de firmar.
  2. **¿El precio es negociable?** — (Negociable) "Sí, hay margen para conversar. Escribinos con tu propuesta y la evaluamos." / (Precio final) "El precio publicado es el precio final."
  3. **¿Qué incluye la venta?** — (equipada) "La casa se vende completa y equipada. Llamanos o escribinos y te contamos todo lo que incluye." / (no equipada) "La casa completa: 4 dormitorios, sala-comedor, cocina interior, cocina exterior y baño."
  4. **¿Se acepta permuta?** — Por ahora no aceptamos permutas: la casa se vende únicamente. Si te interesa comprarla, escribinos y con gusto coordinamos una visita.
  5. **¿Cómo coordino una visita?** — Mandanos un mensaje por WhatsApp o llamanos. Te respondemos en el día y acordamos juntos el día y la hora de la visita.

### 6. Contacto (`#contacto`)
- Sección padding `clamp(48px,6vw,72px) clamp(12px,3vw,32px)`.
- Caja: fondo brand-950, radius 14, padding `clamp(28px,5vw,56px)`, contenido **centrado** (columna, align center, text-align center, max-width 560, gap 16, blanco).
  - Eyebrow "CONTACTO" (lime-500).
  - H2 "¿Te interesa? Coordiná una visita".
  - Botón WhatsApp grande: alto 60, ancho 100% (max 420), radius 8, #1E9E4F (hover #178A43), Poppins 700 18px, ícono 24px + "Escribir por WhatsApp".
  - Línea (15px, 600, blanco, flex wrap centrado, gap 4px 10px): "Teléfono de la casa:" `<a href="tel:+5333205312">+53 33205312</a>` "o" `<a href="tel:+5358281173">+53 58281173</a>` — links blancos, hover lime-500.
  - "Respondemos en el día." (15px blanco).
- No hay formulario.

### 7. Barra fija inferior (solo mobile)
- Visible solo si viewport < 760px **y** el hero salió de pantalla (bottom del hero < 0) **y** el lightbox está cerrado. Usar IntersectionObserver sobre el hero (solo en browser).
- `position: fixed; left:0; right:0; bottom:0; z-index:30;` fondo blanco, borde superior slate-200, sombra `0 -6px 20px rgba(15,23,42,0.10)`, padding `10px 16px calc(10px + env(safe-area-inset-bottom))`, flex space-between gap 12.
- Izquierda: precio (Poppins 800 18px slate-900, ellipsis) + condición (12px slate-500). Derecha: botón WhatsApp alto 48, padding 0 18, radius 8, #1E9E4F, 15px 700, ícono 20px + "WhatsApp".
- En mobile, agregar `padding-bottom: 76px` al wrapper de la página para que la barra no tape el contacto.

### 8. Lightbox (overlay)
- `position: fixed; inset: 0; z-index: 50; background: rgba(7,31,51,0.96);` columna.
- **Top bar** (padding `14px clamp(14px,3vw,28px)`): nombre del ambiente (Poppins 600 16px blanco) a la izquierda; a la derecha contador "3 / 18" (14px, tabular-nums) + botón cerrar 44×44 circular `rgba(255,255,255,0.14)` con ícono X 20px blanco.
- **Centro:** imagen `object-fit: contain`, max-width 1200, alto completo, mismo filtro brightness/contrast. Flechas anterior/siguiente 48×48 circulares (mismo fondo), chevron 22px; **ocultas en mobile** (ahí se navega con swipe).
- **Fila inferior:** chips de los 9 ambientes (scroll horizontal, centrados con `justify-content: safe center`, padding inferior con safe-area). Chip: pill, padding 8px 14px, 13px 600, nowrap. Activo: fondo blanco, texto brand-950. Inactivo: fondo `rgba(255,255,255,0.14)`, texto blanco. Click → salta a la primera foto de ese ambiente.
- **Interacciones:** navegación circular por las 18 fotos (de la última vuelve a la primera). Teclado: ← → navegan, Esc cierra. Swipe horizontal > 40px cambia de foto. Click en el fondo cierra; click en la imagen/chips no (stopPropagation). Bloquear scroll del body mientras está abierto. Foco atrapado dentro del overlay, `role="dialog" aria-modal="true"`.

---

## Íconos
Lucide (stroke 1.75 salvo indicado), inline SVG en un `IconComponent` o vía `lucide-angular`: `map-pin`, `chevron-right`, `chevron-down`, `x`, `truck`, `check`, `house-plus`, `utensils`, `door-open`, y el globo de WhatsApp (path en el HTML de referencia, stroke 1.9). No usar emoji.

## State
- `lightboxIndex = signal<number | null>(null)` (servicio compartido entre hero, galería y lightbox).
- `openFaq = signal<number>(-1)`.
- `pastHero = signal(false)` (IntersectionObserver, solo browser).
- Mobile vs desktop: preferir CSS (`md:` breakpoint en 760px). No hace falta signal de ancho.

## SEO / Open Graph (en SSR)
- `<title>`: Casa 4 dormitorios con ampliación en venta – directo del propietario
- `description`: Casa de 4 dormitorios con ampliación en venta en Ortiz. US$ 12.500. Venta directa del propietario, sin comisión inmobiliaria.
- `og:type` website · `og:title`: 4 dormitorios con ampliación — Ortiz · US$ 12.500
- `og:description`: Venta directa del propietario, sin comisión inmobiliaria. 4 dormitorios, 2 cocinas, papeles al día.
- `og:image`: URL **absoluta** a `/fotos/frente.jpeg` (idealmente una versión recortada 1200×630) · `twitter:card` summary_large_image
- `<html lang="es">`.

## Assets
`public/fotos/` — 18 fotos JPEG de la casa entregadas por el dueño (incluidas en `fotos/`). Las fotos de un solo objeto (TV, heladera) se descartaron a propósito. Recomendado: generar versiones WebP/AVIF y tamaños responsive.

## Files
- `design/Casa en Venta.dc.html` — prototipo de referencia (abrir en el navegador; necesita `support.js` y `_ds/` al lado).
- `design/_ds/…/tokens/*.css` — tokens originales del sistema de diseño (colores, tipografía, espaciado, radios/sombras).
- `design/fotos/` y `fotos/` — imágenes.

## Pendientes a confirmar con el dueño
- Número de WhatsApp definitivo (`59895861842` en este handoff).
- Moneda del precio (US$).
- `tipoPlanta` y `equipada` según la realidad de la casa.
