import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CASA, SEO, SITE_URL } from '../data/casa';

/**
 * Title, meta, Open Graph, Twitter Card, canonical y JSON-LD.
 * Se ejecuta durante el prerender/SSR, así que todo queda en el HTML estático
 * que leen Google, WhatsApp, Facebook, etc.
 */
@Service()
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(): void {
    const url = `${SITE_URL}/`;
    const image = `${SITE_URL}${SEO.ogImage}`;

    this.title.setTitle(SEO.title);

    this.meta.addTags([
      { name: 'description', content: SEO.description },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },

      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: `Casa en venta · ${CASA.barrio}` },
      { property: 'og:url', content: url },
      { property: 'og:title', content: SEO.ogTitle },
      { property: 'og:description', content: SEO.ogDescription },
      { property: 'og:image', content: image },
      { property: 'og:image:secure_url', content: image },
      { property: 'og:image:type', content: 'image/jpeg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: SEO.ogImageAlt },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SEO.ogTitle },
      { name: 'twitter:description', content: SEO.ogDescription },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: SEO.ogImageAlt },
    ]);

    this.setCanonical(url);
    this.setJsonLd(url, image);
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      head.appendChild(link);
    }
    link.href = url;
  }

  private setJsonLd(url: string, image: string): void {
    const head = this.document.head;
    if (head.querySelector('script[data-seo="listing"]')) return;

    const price = CASA.precio.replace(/[^\d]/g, '');
    const data = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: SEO.ogTitle,
      description: SEO.description,
      url,
      image,
      inLanguage: 'es',
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Person', name: 'Propietario' },
      },
      about: {
        '@type': 'SingleFamilyResidence',
        numberOfRooms: 4,
        numberOfBedrooms: 4,
        numberOfBathroomsTotal: 1,
        floorSize: { '@type': 'QuantitativeValue', value: 100, unitCode: 'MTK' },
        address: { '@type': 'PostalAddress', addressLocality: CASA.barrio },
      },
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'listing');
    script.textContent = JSON.stringify(data);
    head.appendChild(script);
  }
}
