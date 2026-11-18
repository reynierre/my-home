/**
 * Datos de la casa. Es la única fuente de verdad del contenido:
 * para cambiar precio, teléfonos o fotos se edita solo este archivo.
 */

/** Dominio público final (sin barra al final). Se usa para canonical y og:image absolutos. */
export const SITE_URL = 'https://www.example.com'; // TODO: reemplazar por el dominio real antes de publicar

export type Condicion = 'Negociable' | 'Precio final';
export type TipoPlanta = 'Planta alta con entrada independiente' | 'Casa de 2 plantas';

export interface Casa {
  readonly barrio: string;
  readonly precio: string;
  readonly condicion: Condicion;
  readonly tipoPlanta: TipoPlanta;
  readonly equipada: boolean;
  readonly whatsapp: string;
  readonly telefonos: readonly string[];
  readonly heroFoto: string;
}

export const CASA: Casa = {
  barrio: 'Ortiz',
  precio: 'US$ 12.500',
  condicion: 'Negociable',
  tipoPlanta: 'Planta alta con entrada independiente',
  equipada: false,
  whatsapp: '59895861842',
  telefonos: ['+53 33205312', '+53 58281173'],
  heroFoto: 'frente',
};

export const ENTRADA_INDEPENDIENTE = CASA.tipoPlanta.includes('independiente');

export const WHATSAPP_URL = `https://wa.me/${CASA.whatsapp}?text=${encodeURIComponent(
  `Hola, vi la casa en venta en ${CASA.barrio} y me interesa coordinar una visita.`,
)}`;

/** `tel:` href a partir de un número con espacios: '+53 33205312' → 'tel:+5333205312'. */
export const telHref = (telefono: string): string => `tel:${telefono.replace(/\s+/g, '')}`;

export interface Room {
  readonly name: string;
  /** Nombres de foto (sin extensión). La primera es la portada. */
  readonly photos: readonly string[];
  /** Índice de la primera foto de este ambiente dentro de PHOTOS. */
  readonly firstIndex: number;
}

export interface Photo {
  /** Nombre de archivo sin extensión ni ancho, p. ej. 'sala-1'. Es el `ngSrc`. */
  readonly name: string;
  readonly room: string;
  readonly alt: string;
}

const ROOM_DEFS: readonly [string, readonly string[]][] = [
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

export const ROOMS: readonly Room[] = ROOM_DEFS.reduce<Room[]>((rooms, [name, photos]) => {
  const prev = rooms.at(-1);
  const firstIndex = prev ? prev.firstIndex + prev.photos.length : 0;
  return [...rooms, { name, photos, firstIndex }];
}, []);

/** Lista plana de las 18 fotos en orden de ambientes. */
export const PHOTOS: readonly Photo[] = ROOMS.flatMap((room) =>
  room.photos.map((name, i) => ({
    name,
    room: room.name,
    alt: `${room.name} — foto ${i + 1} de ${room.photos.length}`,
  })),
);

/** Índice de la foto del hero dentro de PHOTOS (para abrir el lightbox ahí). */
export const HERO_PHOTO_INDEX = PHOTOS.findIndex((p) => p.name === CASA.heroFoto);

export interface Faq {
  readonly q: string;
  readonly a: string;
}

export const FAQS: readonly Faq[] = [
  {
    q: '¿Los papeles están al día?',
    a: 'Sí. La documentación está al día y la podés revisar con tu escribano antes de firmar.',
  },
  {
    q: '¿El precio es negociable?',
    a:
      CASA.condicion === 'Negociable'
        ? 'Sí, hay margen para conversar. Escribinos con tu propuesta y la evaluamos.'
        : 'El precio publicado es el precio final.',
  },
  {
    q: '¿Qué incluye la venta?',
    a: CASA.equipada
      ? 'La casa se vende completa y equipada. Llamanos o escribinos y te contamos todo lo que incluye.'
      : 'La casa completa: 4 dormitorios, sala-comedor, cocina interior, cocina exterior y baño.',
  },
  {
    q: '¿Se acepta permuta?',
    a: 'Por ahora no aceptamos permutas: la casa se vende únicamente. Si te interesa comprarla, escribinos y con gusto coordinamos una visita.',
  },
  {
    q: '¿Cómo coordino una visita?',
    a: 'Mandanos un mensaje por WhatsApp o llamanos. Te respondemos en el día y acordamos juntos el día y la hora de la visita.',
  },
];

/**
 * Textos para buscadores y redes. Largos pensados para no cortarse:
 * title ≤ 60 caracteres, description ≤ 160 (Google), ogTitle ≤ 70 (WhatsApp/Facebook).
 */
export const SEO = {
  title: `Casa en venta en ${CASA.barrio} · 4 dormitorios · ${CASA.precio}`,
  description: `Casa de 4 dormitorios con ampliación en venta en ${CASA.barrio}. ${CASA.precio} ${CASA.condicion.toLowerCase()}, papeles al día. Venta directa del propietario, sin comisión inmobiliaria.`,
  ogTitle: `Casa en venta en ${CASA.barrio} · 4 dormitorios con ampliación · ${CASA.precio}`,
  ogDescription:
    'Venta directa del propietario, sin comisión. 4 dormitorios, 2 cocinas, 100 m², patio de 24 m² y papeles al día. Escribinos por WhatsApp y coordiná una visita.',
  /** Captura 1200×630 del header + hero del sitio, generada por `npm run og` (scripts/og-image.mjs). */
  ogImage: '/og/og-frente.jpg',
  ogImageAlt: `Casa en venta en ${CASA.barrio}: 4 dormitorios con ampliación, ${CASA.precio}`,
} as const;
