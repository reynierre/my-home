import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LightboxStore } from '../../core/lightbox-store';
import { CASA, HERO_PHOTO_INDEX } from '../../data/casa';
import { PriceCard } from './price-card';

/**
 * Hero: foto del frente a pantalla completa con overlay oscuro, título y tarjeta de precio.
 * `data-hero` lo usa la barra fija mobile (IntersectionObserver).
 */
@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, PriceCard],
  host: { class: 'block' },
  template: `
    <section
      data-hero
      aria-labelledby="hero-title"
      class="mx-auto max-w-[1280px] px-[clamp(12px,3vw,32px)] pt-[clamp(12px,2.4vw,28px)] leading-[normal]"
    >
      <div
        class="relative flex min-h-[clamp(520px,72vh,640px)] flex-wrap content-end items-end gap-6 overflow-hidden rounded-lg bg-brand-950 p-[clamp(18px,3vw,36px)] shadow-md"
      >
        <button
          type="button"
          class="group absolute inset-0 cursor-zoom-in focus-visible:outline-none"
          aria-label="Ver foto del frente en grande"
          (click)="openHeroPhoto()"
        >
          <img
            [ngSrc]="heroFoto"
            fill
            priority
            ngSrcset="480w, 768w, 1080w, 1600w"
            sizes="(min-width: 1280px) 1216px, 100vw"
            [alt]="heroAlt"
            class="photo-filter object-cover object-[center_85%]"
          />
          <!-- Overlay: oscurece abajo para que el texto blanco tenga contraste -->
          <span
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,31,51,0.35)_0%,rgba(7,31,51,0.55)_45%,rgba(7,31,51,0.94)_100%)]"
          ></span>
          <!-- Anillo de foco interno (el externo lo recortaría el overflow-hidden) -->
          <span
            class="pointer-events-none absolute inset-1.5 hidden rounded-[10px] outline-2 outline-white group-focus-visible:block"
          ></span>
        </button>

        <div
          class="pointer-events-none relative flex max-w-[640px] min-w-0 flex-[1_1_380px] flex-col gap-[14px] text-white"
        >
          <div class="flex flex-wrap gap-2">
            <span
              class="inline-flex items-center rounded-full bg-lime-50 px-[10px] py-1 font-display text-[11px] leading-none font-bold tracking-[0.03em] text-lime-500"
              >EN VENTA</span
            >
            <span
              class="inline-flex items-center rounded-full bg-brand-50 px-[10px] py-1 font-display text-[11px] leading-none font-bold tracking-[0.03em] text-brand-700 uppercase"
              >{{ tipoPlanta }}</span
            >
          </div>
          <h1
            id="hero-title"
            class="m-0 font-display text-[clamp(30px,4.4vw,54px)] leading-[1.06] font-extrabold tracking-[-0.01em] text-balance"
          >
            4 dormitorios con ampliación — {{ barrio }}
          </h1>
          <p class="m-0 text-[clamp(16px,1.5vw,18px)] leading-[1.5] text-pretty text-white">
            Venta directa del propietario, sin comisión inmobiliaria.
          </p>
        </div>

        <app-price-card />
      </div>
    </section>
  `,
})
export class Hero {
  private readonly lightbox = inject(LightboxStore);

  protected readonly heroFoto = CASA.heroFoto;
  protected readonly heroAlt = `Frente de la casa en venta en ${CASA.barrio}`;
  protected readonly barrio = CASA.barrio;
  protected readonly tipoPlanta = CASA.tipoPlanta;

  protected openHeroPhoto(): void {
    this.lightbox.open(HERO_PHOTO_INDEX);
  }
}
