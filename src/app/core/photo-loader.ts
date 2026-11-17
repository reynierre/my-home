import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

/**
 * Anchos generados por `scripts/optimize-images.mjs` para cada foto:
 *   public/fotos/<nombre>-<ancho>.webp
 * Si la foto original es más angosta, el archivo existe igual (sin agrandar).
 */
export const PHOTO_WIDTHS = [480, 768, 1080, 1600] as const;

const pickWidth = (requested = 1080): number =>
  PHOTO_WIDTHS.find((w) => w >= requested) ?? PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1];

/** `ngSrc="sala-1"` → `/fotos/sala-1-768.webp` */
export const photoLoader = ({ src, width }: ImageLoaderConfig): string =>
  `/fotos/${src}-${pickWidth(width)}.webp`;

export const providePhotoLoader = (): Provider[] => [
  { provide: IMAGE_LOADER, useValue: photoLoader },
  { provide: IMAGE_CONFIG, useValue: { breakpoints: [...PHOTO_WIDTHS], disableImageSizeWarning: true } },
];
