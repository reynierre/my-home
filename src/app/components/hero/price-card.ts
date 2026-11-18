import { Component, inject } from '@angular/core';
import { LightboxStore } from '../../core/lightbox-store';
import { CASA, WHATSAPP_URL } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';

interface Dato {
  /** Valor destacado. `null` = se muestra el ícono de check. */
  readonly value: string | null;
  readonly label: string;
}

/** Tarjeta blanca del hero: precio, condición, grilla 2×3 de datos y CTAs. */
@Component({
  selector: 'app-price-card',
  imports: [Icon],
  host: {
    class:
      'relative ml-auto flex min-w-[min(100%,290px)] flex-[0_1_360px] flex-col gap-4 rounded-lg bg-white p-[22px] shadow-lg',
  },
  template: `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex flex-col gap-[2px]">
        <span class="text-[11px] font-bold tracking-[0.14em] text-slate-500">PRECIO</span>
        <span class="font-display text-[30px] leading-[1.1] font-extrabold text-slate-900">{{ precio }}</span>
      </div>
      <span
        class="rounded-full bg-lime-500 px-3 py-[5px] text-[12px] font-extrabold tracking-[0.04em] text-brand-950"
        >{{ condicion }}</span
      >
    </div>

    <ul
      role="list"
      class="m-0 grid list-none grid-cols-2 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 p-0"
    >
      @for (dato of datos; track dato.label) {
        <li class="flex flex-col gap-px bg-white px-3 py-[10px]">
          @if (dato.value) {
            <span class="font-display text-[19px] font-bold text-brand-600">{{ dato.value }}</span>
          } @else {
            <span class="flex h-7 items-center text-success-500">
              <app-icon name="check" [size]="22" [stroke]="2.4" />
            </span>
          }
          <span class="text-[13px]">{{ dato.label }}</span>
        </li>
      }
    </ul>

    <div class="flex flex-col gap-2">
      <a
        class="btn-wa h-[50px] gap-[10px] text-[16px] font-semibold"
        [href]="whatsappUrl"
        target="_blank"
        rel="noopener"
      >
        <app-icon name="whatsapp" [size]="20" />
        <span>Escribir por WhatsApp</span>
      </a>
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-400 bg-transparent px-[22px] py-3 font-display text-[15px] leading-none font-semibold tracking-[0.01em] text-slate-900 transition-[background-color,transform] duration-[120ms] ease-standard hover:bg-slate-100 active:translate-y-px"
        (click)="openPhotos()"
      >
        Ver fotos
      </button>
    </div>
  `,
})
export class PriceCard {
  private readonly lightbox = inject(LightboxStore);

  protected readonly precio = CASA.precio;
  protected readonly condicion = CASA.condicion;
  protected readonly whatsappUrl = WHATSAPP_URL;
  protected readonly datos: readonly Dato[] = [
    { value: '4', label: 'Dormitorios' },
    { value: '1', label: 'Baño' },
    { value: '2', label: 'Cocinas' },
    { value: '100 m²', label: 'Construidos' },
    { value: '24 m²', label: 'Patio' },
    { value: null, label: 'Papeles al día' },
  ];

  protected openPhotos(): void {
    this.lightbox.open(0);
  }
}
