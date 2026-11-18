import { Component } from '@angular/core';
import { ENTRADA_INDEPENDIENTE } from '../../data/casa';
import { Icon, IconName } from '../../shared/icon/icon';

interface Highlight {
  readonly icon: IconName;
  readonly title: string;
}

const HIGHLIGHTS: readonly (Highlight | false)[] = [
  { icon: 'housePlus', title: 'Ampliación terminada' },
  { icon: 'utensils', title: 'Cocina interior + exterior' },
  ENTRADA_INDEPENDIENTE && { icon: 'doorOpen', title: 'Entrada independiente' },
  { icon: 'truck', title: 'Lista para mudarse' },
];

/** Sección "La casa": descripción + highlights en grilla 2 columnas. */
@Component({
  selector: 'app-la-casa',
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <section
      id="la-casa"
      aria-labelledby="la-casa-title"
      class="container-page grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(28px,4vw,56px)] pt-[clamp(48px,6vw,72px)] leading-[normal]"
    >
      <div class="flex flex-col gap-3">
        <span class="eyebrow leading-[normal]">LA CASA</span>
        <h2 id="la-casa-title" class="h2">Espacio para toda la familia, lista para entrar a vivir</h2>
        <p class="m-0 text-[17px] leading-[1.65] text-pretty">
          Casa de 4 dormitorios con una ampliación ya terminada que suma un dormitorio amplio con
          placard. La distribución separa la zona social (sala, comedor y cocina interior) de los
          dormitorios, y la cocina exterior resuelve el uso diario y las reuniones. Planta alta con
          acceso propio por escalera. Ambientes con ventanas y buena luz natural. A pocas cuadras del
          micro Ortiz.
        </p>
      </div>

      <ul role="list" class="m-0 grid list-none grid-cols-2 gap-3 p-0">
        @for (item of highlights; track item.title) {
          <li class="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-[18px]">
            <span class="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <app-icon [name]="item.icon" [size]="20" />
            </span>
            <span class="font-display text-[15px] font-semibold text-slate-900">{{ item.title }}</span>
          </li>
        }
      </ul>
    </section>
  `,
})
export class LaCasa {
  protected readonly highlights: readonly Highlight[] = HIGHLIGHTS.filter(
    (h): h is Highlight => h !== false,
  );
}
