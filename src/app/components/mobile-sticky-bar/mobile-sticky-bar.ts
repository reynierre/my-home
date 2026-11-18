import {
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LightboxStore } from '../../core/lightbox-store';
import { CASA, WHATSAPP_URL } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';

/**
 * Barra fija inferior con precio + WhatsApp. Solo mobile (`md:hidden`, por CSS) y solo cuando el
 * hero (`[data-hero]`) ya salió por arriba de la pantalla y el visor de fotos está cerrado.
 *
 * Se renderiza siempre (también en SSR) y se oculta con clases: `pastHero` arranca en `false` en
 * el servidor y en el primer render del cliente, así la hidratación no ve diferencias. Oculta queda
 * `invisible` + `inert` → no es enfocable ni clickeable y sale del árbol de accesibilidad.
 */
@Component({
  selector: 'app-mobile-sticky-bar',
  imports: [Icon],
  host: {
    role: 'complementary',
    'aria-label': 'Contacto rápido',
    class:
      'fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-bar transition-[translate,opacity,visibility] duration-200 ease-standard md:hidden',
    '[class.invisible]': '!visible()',
    '[class.opacity-0]': '!visible()',
    '[class.translate-y-full]': '!visible()',
    '[attr.inert]': 'visible() ? null : ""',
  },
  template: `
    <div class="flex min-w-0 flex-col">
      <span class="truncate font-display text-[18px] font-extrabold text-slate-900">{{ casa.precio }}</span>
      <span class="text-xs text-slate-500">{{ casa.condicion }}</span>
    </div>
    <a
      class="btn-wa h-12 flex-none px-[18px] font-body text-[15px] font-bold"
      [href]="whatsappUrl"
      target="_blank"
      rel="noopener"
    >
      <app-icon name="whatsapp" [size]="20" />
      <span>WhatsApp</span>
    </a>
  `,
})
export class MobileStickyBar {
  private readonly lightbox = inject(LightboxStore);

  protected readonly casa = CASA;
  protected readonly whatsappUrl = WHATSAPP_URL;

  /** El borde inferior del hero quedó por encima del viewport. Solo se actualiza en el browser. */
  private readonly pastHero = signal(false);
  protected readonly visible = computed(() => this.pastHero() && !this.lightbox.isOpen());

  constructor() {
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const hero = doc.querySelector('[data-hero]');
      const Observer = doc.defaultView?.IntersectionObserver;
      if (!hero || !Observer) return;

      const observer = new Observer((entries) => {
        const entry = entries.at(-1);
        if (entry) this.pastHero.set(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      });
      observer.observe(hero);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
