import { Component, inject } from '@angular/core';
import { ContactCta } from '../../components/contact-cta/contact-cta';
import { FaqAccordion } from '../../components/faq-accordion/faq-accordion';
import { Hero } from '../../components/hero/hero';
import { LaCasa } from '../../components/la-casa/la-casa';
import { Lightbox } from '../../components/lightbox/lightbox';
import { MobileStickyBar } from '../../components/mobile-sticky-bar/mobile-sticky-bar';
import { RoomGallery } from '../../components/room-gallery/room-gallery';
import { SiteHeader } from '../../components/site-header/site-header';
import { LightboxStore } from '../../core/lightbox-store';
import { Seo } from '../../core/seo';

@Component({
  selector: 'app-casa-page',
  imports: [SiteHeader, Hero, LaCasa, RoomGallery, FaqAccordion, ContactCta, MobileStickyBar, Lightbox],
  // En mobile se reserva espacio para la barra fija inferior (76px) así no tapa el contacto.
  host: { class: 'block min-h-screen bg-slate-50 max-md:pb-[76px]' },
  template: `
    <app-site-header />
    <main>
      <app-hero />
      <app-la-casa />
      <app-room-gallery />
      <app-faq-accordion />
      <app-contact-cta />
    </main>
    <app-mobile-sticky-bar />

    <!-- El visor solo se descarga cuando se abre por primera vez -->
    @defer (when lightbox.isOpen()) {
      <app-lightbox />
    }
  `,
})
export class CasaPage {
  protected readonly lightbox = inject(LightboxStore);

  constructor() {
    inject(Seo).apply();
  }
}
