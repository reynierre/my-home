import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { trapTabKey } from '../../core/focus-trap';
import { LightboxStore } from '../../core/lightbox-store';
import { photoLoader } from '../../core/photo-loader';
import { lockDocumentScroll } from '../../core/scroll-lock';
import { PHOTOS, ROOMS } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';
import { Swipe } from './swipe';

/**
 * Candidatos del srcset del visor. Se declaran explícitos (en vez del srcset automático de
 * NgOptimizedImage) para que la precarga de las fotos vecinas pida exactamente el mismo archivo
 * que después elige el `<img>`, y la navegación salga de caché.
 */
const SRCSET_WIDTHS = [768, 1080, 1600] as const;
const SIZES = '100vw';
const NG_SRCSET = SRCSET_WIDTHS.map((w) => `${w}w`).join(', ');

const srcsetFor = (name: string): string =>
  SRCSET_WIDTHS.map((width) => `${photoLoader({ src: name, width })} ${width}w`).join(', ');

/**
 * Visor de fotos a pantalla completa. Vive dentro de `@defer (when lightbox.isOpen())`, así que
 * solo existe en el browser; una vez cargado queda montado y se muestra/oculta con `@if`.
 *
 * - `<dialog>` nativo con `showModal()`: el resto de la página queda `inert` (foco y lector de
 *   pantalla no se escapan), va al top layer, y Esc / "atrás" en Android disparan `cancel`.
 *   Además se cicla Tab dentro del diálogo y se devuelve el foco al elemento que lo abrió.
 *   El <dialog> lleva `flex` (no `open:flex`) para tener tamaño desde que entra al DOM: la imagen
 *   `fill` ya mide alto real en su ngOnInit, y `showModal()` corre en la misma tarea, antes de pintar.
 * - Imagen con NgOptimizedImage (`fill` + `priority`); `ngSrc` cambia al navegar y la directiva
 *   recalcula src/srcset. Se mantiene un solo `<img>` (y no uno por foto) porque cada instancia
 *   `priority` cuenta para el aviso de "más de 10 imágenes priority" en desarrollo.
 */
@Component({
  selector: 'app-lightbox',
  imports: [NgOptimizedImage, Icon, Swipe],
  templateUrl: './lightbox.html',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class Lightbox {
  protected readonly store = inject(LightboxStore);
  private readonly doc = inject(DOCUMENT);

  protected readonly rooms = ROOMS;
  protected readonly total = this.store.total;
  protected readonly ngSrcset = NG_SRCSET;
  protected readonly sizes = SIZES;

  /** Posición 1-based de la foto actual ("3 / 18"). */
  protected readonly position = computed(() => (this.store.index() ?? 0) + 1);
  protected readonly activeRoomIndex = computed(() => {
    const room = this.store.photo()?.room;
    return ROOMS.findIndex((r) => r.name === room);
  });

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly chipRow = viewChild<ElementRef<HTMLElement>>('chipRow');
  private readonly chips = viewChildren<ElementRef<HTMLButtonElement>>('chip');

  private readonly preloaded = new Set<string>();

  constructor() {
    // Apertura / cierre: corre cuando el <dialog> aparece o desaparece del DOM (no al navegar).
    afterRenderEffect((onCleanup) => {
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;

      const opener = this.doc.activeElement as HTMLElement | null;
      const unlockScroll = lockDocumentScroll(this.doc);
      if (!dialog.open) dialog.showModal();
      untracked(this.closeButton)?.nativeElement.focus();

      onCleanup(() => {
        unlockScroll();
        if (opener && opener !== this.doc.body && opener.isConnected) {
          opener.focus({ preventScroll: true });
        }
      });
    });

    // Mantiene visible el chip del ambiente activo (centrado en la fila si hay scroll).
    let lastRow: HTMLElement | undefined;
    afterRenderEffect(() => {
      const row = this.chipRow()?.nativeElement;
      const chip = this.chips()[this.activeRoomIndex()]?.nativeElement;
      if (!row || !chip) return;

      // Al abrir salta directo; después se desplaza suave (salvo reduced-motion).
      const smooth = row === lastRow && !this.prefersReducedMotion();
      lastRow = row;
      const rowRect = row.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();
      const left =
        row.scrollLeft + chipRect.left - rowRect.left - (rowRect.width - chipRect.width) / 2;
      row.scrollTo({ left, behavior: smooth ? 'smooth' : 'instant' });
    });

    // Precarga la foto anterior y la siguiente para que la navegación sea instantánea.
    afterRenderEffect(() => {
      const i = this.store.index();
      if (i === null) return;
      this.preload(PHOTOS[(i + 1) % this.total].name);
      this.preload(PHOTOS[(i - 1 + this.total) % this.total].name);
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog || !this.store.isOpen() || event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key) {
      case 'Escape':
        // preventDefault evita que el <dialog> se cierre solo: el estado lo maneja el store.
        event.preventDefault();
        this.store.close();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.store.next();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.store.prev();
        break;
      case 'Tab':
        trapTabKey(event, dialog);
        break;
    }
  }

  /** Esc o "atrás" (Android) sobre el diálogo nativo: cerramos vía store para quitarlo del DOM. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.store.close();
  }

  /** Click en el fondo cierra; en botones, chips o sobre la foto (no sus franjas vacías) no. */
  protected onDialogClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target || target.closest('button, [data-keep-open]')) return;
    if (target.tagName === 'IMG' && hitsPaintedImage(target as HTMLImageElement, event)) return;
    this.store.close();
  }

  protected step(direction: 1 | -1): void {
    if (direction === 1) this.store.next();
    else this.store.prev();
  }

  /** Fundido sutil cada vez que entra una foto nueva (WAAPI: no hay que togglear clases). */
  protected onImageLoad(event: Event): void {
    if (this.prefersReducedMotion()) return;
    (event.target as HTMLImageElement).animate([{ opacity: 0.35 }, { opacity: 1 }], {
      duration: 200,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    });
  }

  private preload(name: string): void {
    if (this.preloaded.has(name)) return;
    this.preloaded.add(name);

    const img = this.doc.createElement('img');
    img.decoding = 'async';
    img.fetchPriority = 'low';
    // Mismo sizes + srcset que el <img> del visor → el browser elige el mismo candidato.
    img.sizes = SIZES;
    img.srcset = srcsetFor(name);
    img.src = photoLoader({ src: name });
  }

  private prefersReducedMotion(): boolean {
    return this.doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}

/**
 * Con `object-fit: contain` la caja del <img> es más grande que la foto pintada; las franjas
 * vacías cuentan como fondo (cierran), igual que el resto del overlay.
 */
function hitsPaintedImage(img: HTMLImageElement, { clientX, clientY }: MouseEvent): boolean {
  const { naturalWidth, naturalHeight } = img;
  if (!naturalWidth || !naturalHeight) return true;

  const box = img.getBoundingClientRect();
  const scale = Math.min(box.width / naturalWidth, box.height / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const left = box.left + (box.width - width) / 2;
  const top = box.top + (box.height - height) / 2;
  return clientX >= left && clientX <= left + width && clientY >= top && clientY <= top + height;
}
