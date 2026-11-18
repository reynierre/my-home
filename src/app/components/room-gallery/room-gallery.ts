import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LightboxStore } from '../../core/lightbox-store';
import { CASA, PHOTOS, ROOMS } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';

interface RoomCard {
  readonly name: string;
  readonly cover: string;
  readonly countLabel: string;
  /** Nombre accesible del botón (igual al texto visible, sin repetir el alt de la portada). */
  readonly ariaLabel: string;
  readonly firstIndex: number;
}

const ROOM_CARDS: readonly RoomCard[] = ROOMS.map((room) => {
  const countLabel = room.photos.length === 1 ? '1 foto' : `${room.photos.length} fotos`;
  return {
    name: room.name,
    cover: room.photos[0],
    countLabel,
    ariaLabel: `${room.name}, ${countLabel}`,
    firstIndex: room.firstIndex,
  };
});

/**
 * Tarjetas por ambiente. Desktop: 3 por fila (flex-wrap).
 * Mobile (< 760px): carrusel horizontal con scroll-snap, solo CSS.
 */
@Component({
  selector: 'app-room-gallery',
  imports: [NgOptimizedImage, Icon],
  host: { class: 'block' },
  template: `
    <section
      id="fotos"
      aria-labelledby="fotos-title"
      class="container-page flex flex-col gap-[22px] pt-[clamp(48px,6vw,72px)] leading-[normal]"
    >
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-2">
          <span class="eyebrow leading-[normal]">FOTOS · {{ photoCount }}</span>
          <h2 id="fotos-title" class="h2">Recorré la casa por ambiente</h2>
        </div>
        @if (equipada) {
          <span
            class="flex items-center gap-1.5 rounded-full border border-brand-600 bg-white px-[14px] py-[7px] text-[13px] font-bold text-brand-600"
          >
            <app-icon name="check" [size]="16" [stroke]="2.2" />
            <span>Se vende equipada</span>
          </span>
        }
      </div>

      <div
        class="-mx-1 flex snap-x snap-mandatory flex-wrap gap-5 overflow-x-auto px-1 pt-1 pb-3 max-md:flex-nowrap"
      >
        @for (room of rooms; track room.name) {
          <button
            type="button"
            class="group flex min-w-0 flex-[0_1_calc((100%_-_40px)_/_3)] cursor-pointer snap-start flex-col overflow-hidden rounded-md border border-slate-200 bg-white text-left shadow-sm transition-[translate,box-shadow] duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-md max-md:flex-[0_0_78%]"
            [attr.aria-label]="room.ariaLabel"
            (click)="open(room.firstIndex)"
          >
            <span class="relative block aspect-[4/3] w-full overflow-hidden bg-slate-200">
              <img
                [ngSrc]="room.cover"
                fill
                ngSrcset="480w, 768w, 1080w"
                sizes="(min-width: 1280px) 392px, (min-width: 760px) 31vw, 78vw"
                [alt]="room.name"
                class="photo-filter object-cover transition-transform duration-[380ms] ease-[ease] group-hover:scale-105"
              />
            </span>
            <span class="flex w-full items-center justify-between gap-2 px-4 py-[14px]">
              <span class="flex min-w-0 flex-col gap-[2px]">
                <span class="font-display text-[15px] font-semibold text-slate-900">{{ room.name }}</span>
                <span class="text-[13px] text-slate-500">{{ room.countLabel }}</span>
              </span>
              <span class="flex flex-none text-brand-600">
                <app-icon name="chevronRight" [size]="18" />
              </span>
            </span>
          </button>
        }
      </div>
    </section>
  `,
})
export class RoomGallery {
  private readonly lightbox = inject(LightboxStore);

  protected readonly photoCount = PHOTOS.length;
  protected readonly equipada = CASA.equipada;
  protected readonly rooms = ROOM_CARDS;

  protected open(index: number): void {
    this.lightbox.open(index);
  }
}
