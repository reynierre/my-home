// Lee de src/app/data/casa.ts los pocos valores que necesitan los scripts de assets
// (og-image, seo-files), para que casa.ts siga siendo la única fuente de verdad.
// Se lee con regex a propósito: no depende de compilar TypeScript ni de sus imports.

import { readFileSync } from 'node:fs';

const CASA_TS = new URL('../src/app/data/casa.ts', import.meta.url);

const source = readFileSync(CASA_TS, 'utf8');

const pick = (label, regex) => {
  const match = source.match(regex);
  if (!match) throw new Error(`No se encontró ${label} en src/app/data/casa.ts (${regex})`);
  return match[1];
};

/** Lee una propiedad string del objeto CASA: `  precio: 'US$ 12.500',` */
const casaField = (key) => pick(`CASA.${key}`, new RegExp(`^\\s*${key}:\\s*'([^']*)'`, 'm'));

/** Dominio público, sin barra final. */
export const SITE_URL = pick('SITE_URL', /export const SITE_URL\s*=\s*'([^']+)'/).replace(
  /\/+$/,
  '',
);

export const CASA = {
  barrio: casaField('barrio'),
  precio: casaField('precio'),
  condicion: casaField('condicion'),
  tipoPlanta: casaField('tipoPlanta'),
  heroFoto: casaField('heroFoto'),
};

/** Ruta pública de la imagen Open Graph (SEO.ogImage), p. ej. '/og/og-frente.jpg'. */
export const OG_IMAGE_PATH = pick('SEO.ogImage', /^\s*ogImage:\s*'([^']+)'/m);
