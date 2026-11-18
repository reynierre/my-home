import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  DOCUMENT,
  ElementRef,
  Renderer2,
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

/**
 * Candidatos del srcset del visor, explícitos (no el srcset automático de NgOptimizedImage) para
 * que la precarga pida exactamente el mismo archivo que después elige cada `<img>`.
 */
const SRCSET_WIDTHS = [768, 1080, 1600] as const;
const NG_SRCSET = SRCSET_WIDTHS.map((w) => `${w}w`).join(', ');

/**
 * Ancho real de la caja de la foto dentro de cada slide (ver padding de `.slide` en el template):
 * mobile `100vw - 2·8px`; desde md `100vw - 2·(clamp(8px, 2vw, 24px) + 64px)`, tope 1200px.
 * Las slides lazy reciben `sizes="auto, …"` (Chrome usa el ancho real); las eager y la precarga
 * usan esta fórmula equivalente → todas eligen el mismo candidato y la navegación sale de caché.
 */
const SIZES = '(min-width: 1376px) 1200px, (min-width: 760px) calc(96vw - 128px), calc(100vw - 16px)';

/** Porción de la slide que tiene que verse para tomarla como la actual. */
const VISIBLE_RATIO = 0.6;

const srcsetFor = (name: string): string =>
  SRCSET_WIDTHS.map((width) => `${photoLoader({ src: name, width })} ${width}w`).join(', ');

interface SlideLoading {
  readonly priority: boolean;
  readonly loading: 'eager' | 'lazy' | undefined;
}

/**
 * Visor de fotos a pantalla completa. Vive dentro de `@defer (when lightbox.isOpen())`, así que
 * solo existe en el browser; una vez cargado queda montado y se muestra/oculta con `@if`.
 *
 * - `<dialog>` nativo con `showModal()`: el resto de la página queda `inert`, va al top layer, y
 *   Esc / "atrás" en Android disparan `cancel`. Se cicla Tab dentro y se devuelve el foco al
 *   elemento que lo abrió. Lleva `flex` (no `open:flex`) para tener tamaño desde que entra al DOM.
 * - Carrusel con scroll nativo + scroll-snap: el dedo (o el trackpad) arrastra la foto con inercia
 *   real en iOS/Android. Sincronización en las dos direcciones:
 *     · usuario → store: un IntersectionObserver (root = track) marca la slide visible ≥ 60%.
 *     · store → track: flechas, teclado, chips y la apertura desplazan el track (suave en pasos
 *       de ±1, instantáneo en saltos y en la vuelta 18 → 1). `trackIndex` evita el rebote: si el
 *       índice vino del propio scroll no se vuelve a desplazar.
 * - Imágenes: la foto abierta `priority`, sus vecinas `eager`, el resto `lazy` (se decide una vez
 *   al abrir; NgOptimizedImage no admite cambiar `loading`/`priority` después). Al navegar se
 *   precargan las vecinas lazy de la nueva foto.
 */
@Component({
  selector: 'app-lightbox',
  imports: [NgOptimizedImage, Icon],
  templateUrl: './lightbox.html',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class Lightbox {
  protected readonly store = inject(LightboxStore);
  private readonly doc = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  protected readonly photos = PHOTOS;
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

  /** Índice con el que se abrió el visor. Solo cambia al abrir/cerrar, no al navegar. */
  private readonly openedAt = computed(() =>
    this.store.isOpen() ? untracked(this.store.index) : null,
  );
  /** Estrategia de carga por slide: abierta `priority`, vecinas (circular) `eager`, resto `lazy`. */
  protected readonly slideLoading = computed<readonly SlideLoading[]>(() => {
    const at = this.openedAt();
    return PHOTOS.map((_, i) => {
      const distance = at === null ? -1 : (i - at + this.total) % this.total;
      if (distance === 0) return { priority: true, loading: undefined };
      const neighbour = distance === 1 || distance === this.total - 1;
      return { priority: false, loading: neighbour ? 'eager' : 'lazy' };
    });
  });

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly slides = viewChildren<ElementRef<HTMLElement>>('slide');
  private readonly progressFill = viewChild<ElementRef<HTMLElement>>('progressFill');
  private readonly chipRow = viewChild<ElementRef<HTMLElement>>('chipRow');
  private readonly chips = viewChildren<ElementRef<HTMLButtonElement>>('chip');

  /** Slide en la que está (o hacia la que va) el track. -1 = recién abierto, sin posicionar. */
  private trackIndex = -1;
  /** Destino de un desplazamiento suave en curso: mientras tanto el IO ignora otras slides. */
  private scrollTarget: number | null = null;
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
        this.trackIndex = -1;
        this.scrollTarget = null;
        if (opener && opener !== this.doc.body && opener.isConnected) {
          opener.focus({ preventScroll: true });
        }
      });
    });

    // store → track. Al abrir posiciona de inmediato (antes de pintar: no se ve el recorrido).
    afterRenderEffect(() => {
      const i = this.store.index();
      const track = this.track()?.nativeElement;
      const slide = i === null ? undefined : this.slides()[i]?.nativeElement;
      if (i === null || !track || !slide || i === this.trackIndex) return;

      const from = this.trackIndex;
      this.trackIndex = i;
      const left = slide.offsetLeft;
      if (Math.abs(track.scrollLeft - left) < 1) return;

      const smooth = from >= 0 && Math.abs(i - from) === 1 && !this.prefersReducedMotion();
      this.scrollTarget = smooth ? i : null;
      track.scrollTo({ left, behavior: smooth ? 'smooth' : 'instant' });
    });

    // track → store: la slide visible ≥ 60% pasa a ser la actual.
    afterRenderEffect((onCleanup) => {
      const track = this.track()?.nativeElement;
      const slides = this.slides();
      const Observer = this.doc.defaultView?.IntersectionObserver;
      if (!track || !slides.length || !Observer) return;

      const observer = new Observer((entries) => this.onSlidesIntersect(entries), {
        root: track,
        threshold: VISIBLE_RATIO,
      });
      slides.forEach((slide) => observer.observe(slide.nativeElement));

      // Si el usuario toca/arrastra durante un desplazamiento suave, manda él.
      const release = () => {
        this.scrollTarget = null;
      };
      const passive = { passive: true };
      const unlisten = ['touchstart', 'pointerdown', 'wheel', 'scrollend'].map((type) =>
        this.renderer.listen(track, type, release, passive),
      );

      onCleanup(() => {
        observer.disconnect();
        unlisten.forEach((off) => off());
      });
    });

    // Barra de progreso (mobile): sigue al dedo escribiendo el transform directo, sin pasar por
    // detección de cambios; un frame por evento de scroll como máximo.
    afterRenderEffect((onCleanup) => {
      const track = this.track()?.nativeElement;
      const fill = this.progressFill()?.nativeElement;
      const win = this.doc.defaultView;
      if (!track || !fill || !win) return;

      let frame = 0;
      const paint = () => {
        frame = 0;
        const progress = (track.scrollLeft / Math.max(track.clientWidth, 1) + 1) / this.total;
        fill.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
      };
      paint();
      const off = this.renderer.listen(
        track,
        'scroll',
        () => {
          frame ||= win.requestAnimationFrame(paint);
        },
        { passive: true },
      );
      onCleanup(() => {
        off();
        if (frame) win.cancelAnimationFrame(frame);
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

    // Precarga las vecinas lazy de la foto actual (las eager ya cargan solas).
    afterRenderEffect(() => {
      const i = this.store.index();
      if (i === null) return;
      const loading = untracked(this.slideLoading);
      for (const k of [(i + 1) % this.total, (i - 1 + this.total) % this.total]) {
        if (loading[k].loading === 'lazy') this.preload(PHOTOS[k].name);
      }
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

  /** Si la foto que se está mirando termina de cargar recién ahora, entra con un fundido. */
  protected onImageLoad(event: Event, index: number): void {
    if (index !== this.store.index() || this.prefersReducedMotion()) return;
    (event.target as HTMLImageElement).animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    });
  }

  private onSlidesIntersect(entries: IntersectionObserverEntry[]): void {
    const entry = entries.filter((e) => e.intersectionRatio >= VISIBLE_RATIO).at(-1);
    if (!entry || !this.store.isOpen()) return;

    const i = Number((entry.target as HTMLElement).dataset['index']);
    if (this.scrollTarget !== null) {
      if (i !== this.scrollTarget) return;
      this.scrollTarget = null;
    }
    this.trackIndex = i;
    this.store.open(i);
  }

  private preload(name: string): void {
    if (this.preloaded.has(name)) return;
    this.preloaded.add(name);

    const img = this.doc.createElement('img');
    img.decoding = 'async';
    img.fetchPriority = 'low';
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
