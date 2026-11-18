import { Component, signal } from '@angular/core';
import { FAQS } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';

/**
 * Preguntas frecuentes. Solo un ítem abierto a la vez; todos cerrados al inicio.
 * Las respuestas quedan en el DOM con `hidden="until-found"` (indexables y encontrables
 * con Ctrl+F); el evento `beforematch` abre el ítem que contiene la coincidencia.
 */
@Component({
  selector: 'app-faq-accordion',
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      class="container-page flex max-w-[880px] flex-col gap-5 pt-[clamp(48px,6vw,72px)] leading-[normal]"
    >
      <div class="flex flex-col gap-2">
        <span class="eyebrow leading-[normal]">PREGUNTAS FRECUENTES</span>
        <h2 id="preguntas-title" class="h2">Lo que todos preguntan</h2>
      </div>

      <div class="flex flex-col rounded-md border border-slate-200 bg-white">
        @for (faq of faqs; track faq.q; let i = $index) {
          @let open = openFaq() === i;
          <div class="border-slate-200 not-last:border-b">
            <h3 class="m-0">
              <button
                type="button"
                [id]="'faq-q-' + i"
                class="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-[18px] text-left font-display text-[16px] font-semibold text-slate-900 focus-visible:-outline-offset-2"
                [attr.aria-expanded]="open"
                [attr.aria-controls]="'faq-a-' + i"
                (click)="toggle(i)"
              >
                <span>{{ faq.q }}</span>
                <span
                  class="flex text-brand-600 transition-transform duration-200 ease-[ease]"
                  [class.rotate-180]="open"
                >
                  <app-icon name="chevronDown" [size]="18" />
                </span>
              </button>
            </h3>
            <div
              role="region"
              [id]="'faq-a-' + i"
              [attr.aria-labelledby]="'faq-q-' + i"
              [attr.hidden]="open ? null : 'until-found'"
              (beforematch)="openFaq.set(i)"
            >
              <p class="m-0 px-5 pb-[18px] leading-[1.6]">{{ faq.a }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class FaqAccordion {
  protected readonly faqs = FAQS;
  protected readonly openFaq = signal(-1);

  protected toggle(index: number): void {
    this.openFaq.update((current) => (current === index ? -1 : index));
  }
}
