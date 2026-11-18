import { Component } from '@angular/core';
import { CASA, WHATSAPP_URL, telHref } from '../../data/casa';
import { Icon } from '../../shared/icon/icon';

interface Telefono {
  readonly label: string;
  readonly href: string;
}

/** Bloque final de contacto: CTA grande de WhatsApp + teléfonos. Sin formulario. */
@Component({
  selector: 'app-contact-cta',
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      class="mx-auto max-w-[1280px] px-[clamp(12px,3vw,32px)] py-[clamp(48px,6vw,72px)] leading-[normal]"
    >
      <div class="flex justify-center rounded-lg bg-brand-950 p-[clamp(28px,5vw,56px)] text-center">
        <div class="flex w-full max-w-[560px] flex-col items-center gap-4 text-white">
          <span class="eyebrow leading-[normal] text-lime-500">CONTACTO</span>
          <h2 id="contacto-title" class="h2 text-[clamp(28px,3.2vw,36px)] text-white">
            ¿Te interesa? Coordiná una visita
          </h2>
          <a
            class="btn-wa h-[60px] w-full max-w-[420px] gap-3 text-[18px] font-bold"
            [href]="whatsappUrl"
            target="_blank"
            rel="noopener"
          >
            <app-icon name="whatsapp" [size]="24" />
            <span>Escribir por WhatsApp</span>
          </a>
          <div class="flex flex-col items-center gap-1 text-[15px]">
            <span class="flex flex-wrap justify-center gap-x-[10px] gap-y-1 font-semibold text-white">
              <span>Teléfono de la casa:</span>
              @for (tel of telefonos; track tel.href; let first = $first) {
                @if (!first) {
                  <span>o</span>
                }
                <!-- Área táctil de 40px+ (py) sin mover el layout (-my equivalente) -->
                <a
                  [href]="tel.href"
                  class="-my-[11px] inline-flex items-center py-[11px] text-white hover:text-lime-500"
                  >{{ tel.label }}</a
                >
              }
            </span>
            <span class="text-white">Respondemos en el día.</span>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactCta {
  protected readonly whatsappUrl = WHATSAPP_URL;
  protected readonly telefonos: readonly Telefono[] = CASA.telefonos.map((label) => ({
    label,
    href: telHref(label),
  }));
}
