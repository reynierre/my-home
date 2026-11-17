import { Component, computed, input } from '@angular/core';

/**
 * Paths SVG (viewBox 24×24, estilo Lucide) tomados del sistema de diseño del handoff.
 * Cada string puede tener varios subpaths separados por ' M'; se renderizan como un único <path>.
 */
const ICONS = {
  mapPin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  chevronRight: 'M9 18l6-6-6-6',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronDown: 'M6 9l6 6 6-6',
  x: 'M18 6 6 18 M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  truck:
    'M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1 M14 9h4l4 4v4a1 1 0 0 1-1 1h-1 M8 18h6 M7.5 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z M20.5 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  housePlus:
    'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M12 10v6 M9 13h6',
  utensils:
    'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
  doorOpen:
    'M13 4h3a2 2 0 0 1 2 2v14 M2 20h3 M13 20h9 M10 12v.01 M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z',
  whatsapp:
    'M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21 M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1',
} as const;

export type IconName = keyof typeof ICONS;

/** Stroke por defecto de cada ícono según el diseño (Lucide 1.75, WhatsApp 1.9). */
const DEFAULT_STROKE: Partial<Record<IconName, number>> = { whatsapp: 1.9 };

/**
 * Ícono SVG inline, decorativo (aria-hidden). El color sale de `currentColor`,
 * así que se controla con clases `text-*` en el host o en el padre.
 *
 * <app-icon name="whatsapp" [size]="20" />
 */
@Component({
  selector: 'app-icon',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly stroke = input<number | undefined>(undefined);

  protected readonly path = computed(() => ICONS[this.name()]);
  protected readonly strokeWidth = computed(
    () => this.stroke() ?? DEFAULT_STROKE[this.name()] ?? 1.75,
  );
}
