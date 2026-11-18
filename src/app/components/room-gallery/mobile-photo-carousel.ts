import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LightboxStore } from '../../core/lightbox-store';
import { PHOTOS, ROOMS } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';

interface SlidePhoto {
  readonly name: string;
  /** `ngSrc` del recorte 4:5 pre-generado (scripts/optimize-images.mjs). */
  readonly src: string;
  readonly room: string;
  /** Índice global dentro de PHOTOS (para abrir el lightbox ahí). */
  readonly index: number;
}

interface FilterChip {
  /** `null` = "Todas". */
  readonly room: string | null;
  readonly label: string;
  readonly count: number;
  readonly countLabel: string;
}

const fotos = (n: number): string => (n === 1 ? '1 foto' : `${n} fotos`);

const ALL_PHOTOS: readonly SlidePhoto[] = PHOTOS.map((p, index) => ({
  name: p.name,
  src: `vertical/${p.name}`,
  room: p.room,
  index,
}));

const CHIPS: readonly FilterChip[] = [
  { room: null, label: 'Todas', count: PHOTOS.length, countLabel: fotos(PHOTOS.length) },
  ...ROOMS.map((r) => ({
    room: r.name,
    label: r.name,
    count: r.photos.length,
    countLabel: fotos(r.photos.length),
  })),
];

/** Proporción visible a partir de la cual una foto cuenta como "la actual". */
const VISIBLE_RATIO = 0.6;

/**
 * Galería mobile (< 760px): chips para filtrar por ambiente + carrusel con scroll-snap nativo,
 * contador, barra de progreso y flechas. El índice actual se sincroniza con IntersectionObserver
 * (solo en el browser); el servidor renderiza el estado inicial ("Todas", foto 1).
 */
@Component({
  selector: 'app-mobile-photo-carousel',
  imports: [NgOptimizedImage, Icon],
  // --gutter = padding lateral de .container-page: chips y carrusel van de borde a borde
  host: { class: 'block md:hidden [--gutter:clamp(16px,3vw,32px)]' },
  templateUrl: './mobile-photo-carousel.html',
})
export class MobilePhotoCarousel {
  private readonly lightbox = inject(LightboxStore);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly chipRow = viewChild.required<ElementRef<HTMLElement>>('chipRow');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly slides = viewChildren<ElementRef<HTMLElement>>('slide');

  protected readonly chips = CHIPS;
  protected readonly filter = signal<string | null>(null);
  protected readonly current = signal(0);
  /** La fila de chips llegó al final: se quita el fade del borde derecho. */
  protected readonly chipsAtEnd = signal(false);

  protected readonly photos = computed(() => {
    const room = this.filter();
    return room === null ? ALL_PHOTOS : ALL_PHOTOS.filter((p) => p.room === room);
  });
  protected readonly total = computed(() => this.photos().length);
  protected readonly currentPhoto = computed(() => this.photos()[this.current()] ?? this.photos()[0]);
  protected readonly progress = computed(() => ((this.current() + 1) / this.total()) * 100);
  protected readonly atStart = computed(() => this.current() === 0);
  protected readonly atEnd = computed(() => this.current() >= this.total() - 1);

  /** Destino de una navegación con flechas en curso (permite tocar "siguiente" varias veces seguidas). */
  private pending: number | null = null;

  constructor() {
    // Sincroniza `current` con la foto visible. Se vuelve a observar cada vez que cambia el set filtrado.
    afterRenderEffect((onCleanup) => {
      const root = this.track().nativeElement;
      const slides = this.slides().map((s) => s.nativeElement);
      const ratios = new Map<number, number>();

      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            ratios.set(Number((entry.target as HTMLElement).dataset['index']), entry.intersectionRatio);
          }
          let best = -1;
          let bestRatio = VISIBLE_RATIO;
          for (const [i, ratio] of ratios) {
            if (ratio >= bestRatio) {
              best = i;
              bestRatio = ratio;
            }
          }
          if (best === -1) return;
          this.current.set(best);
          if (best === this.pending) this.pending = null;
        },
        { root, threshold: [VISIBLE_RATIO, 1] },
      );
      slides.forEach((slide) => io.observe(slide));
      onCleanup(() => io.disconnect());
    });

    // Fade del borde derecho de los chips: listener pasivo (no dispara change detection en cada scroll).
    afterNextRender(() => {
      const row = this.chipRow().nativeElement;
      const update = (): void =>
        this.chipsAtEnd.set(row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
      row.addEventListener('scroll', update, { passive: true });
      update();
      this.destroyRef.onDestroy(() => row.removeEventListener('scroll', update));
    });
  }

  protected selectFilter(room: string | null, chip: HTMLElement): void {
    this.centerChip(chip);
    if (this.filter() === room) return;
    this.filter.set(room);
    this.current.set(0);
    this.pending = null;
    // Al cambiar el set, volver a la primera foto sin animación (después de renderizar las nuevas).
    afterNextRender(
      { write: () => this.track().nativeElement.scrollTo({ left: 0, behavior: 'instant' }) },
      { injector: this.injector },
    );
  }

  protected step(delta: number): void {
    const from = this.pending ?? this.current();
    const to = Math.min(Math.max(from + delta, 0), this.total() - 1);
    if (to === from) return;
    this.pending = to;
    this.scrollToSlide(to);
  }

  /** El usuario toma el control (swipe) o terminó la animación: se descarta el destino pendiente. */
  protected clearPending(): void {
    this.pending = null;
  }

  protected openPhoto(photo: SlidePhoto): void {
    this.lightbox.open(photo.index);
  }

  private scrollToSlide(i: number): void {
    const slides = this.slides();
    const slide = slides[i]?.nativeElement;
    const first = slides[0]?.nativeElement;
    if (!slide || !first) return;
    this.track().nativeElement.scrollTo({
      left: slide.offsetLeft - first.offsetLeft,
      behavior: this.scrollBehavior(),
    });
  }

  private centerChip(chip: HTMLElement): void {
    const row = this.chipRow().nativeElement;
    row.scrollTo({
      left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2,
      behavior: this.scrollBehavior(),
    });
  }

  private scrollBehavior(): ScrollBehavior {
    const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduce ? 'instant' : 'smooth';
  }
}
