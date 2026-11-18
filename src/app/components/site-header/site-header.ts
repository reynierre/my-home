import { Component } from '@angular/core';
import { CASA, WHATSAPP_URL } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';

interface NavLink {
  readonly href: string;
  readonly label: string;
}

/**
 * Header sticky. El host usa `display: contents` para que el `<header>` quede
 * como hijo directo del layout de la página y `position: sticky` funcione en todo el scroll.
 */
@Component({
  selector: 'app-site-header',
  imports: [Icon],
  host: { class: 'contents' },
  template: `
    <header
      class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 leading-[normal] backdrop-blur-[8px]"
    >
      <div class="container-page flex items-center justify-between gap-4 py-3">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex size-9 flex-none items-center justify-center rounded-md bg-brand-600 text-white">
            <app-icon name="mapPin" [size]="18" />
          </div>
          <div class="flex min-w-0 flex-col">
            <span class="font-display text-[15px] font-bold text-slate-900">Casa en venta</span>
            <span class="text-[12px] text-slate-500">{{ barrio }} · Dueño directo</span>
          </div>
        </div>

        <nav aria-label="Principal" class="flex items-center gap-[26px] text-[14px] font-semibold">
          <ul role="list" class="m-0 flex list-none items-center gap-[26px] p-0 max-md:hidden">
            @for (link of links; track link.href) {
              <li>
                <a [href]="link.href" class="text-slate-700">{{ link.label }}</a>
              </li>
            }
          </ul>
          <a
            class="btn-wa h-[38px] px-[14px] font-body text-[14px] font-bold"
            [href]="whatsappUrl"
            target="_blank"
            rel="noopener"
            aria-label="Escribir por WhatsApp"
          >
            <app-icon name="whatsapp" [size]="18" />
            <span>WhatsApp</span>
          </a>
        </nav>
      </div>
    </header>
  `,
})
export class SiteHeader {
  protected readonly barrio = CASA.barrio;
  protected readonly whatsappUrl = WHATSAPP_URL;
  protected readonly links: readonly NavLink[] = [
    { href: '#la-casa', label: 'La casa' },
    { href: '#fotos', label: 'Fotos' },
    { href: '#preguntas', label: 'Preguntas' },
  ];
}
