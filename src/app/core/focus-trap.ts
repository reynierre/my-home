const TABBABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Elementos alcanzables con Tab dentro de `container`, en orden del DOM (omite los `display: none`). */
export function tabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Mantiene el foco dentro de `container` con Tab / Shift+Tab: desde el último vuelve al primero
 * y viceversa. Si el foco quedó afuera (p. ej. en el body tras un click), lo trae de vuelta.
 * Llamar desde un listener de `keydown`; ignora cualquier tecla que no sea Tab.
 */
export function trapTabKey(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== 'Tab') return;

  const tabbables = tabbableElements(container);
  const first = tabbables[0];
  const last = tabbables.at(-1);
  if (!first || !last) {
    event.preventDefault();
    return;
  }

  const active = container.ownerDocument.activeElement;
  const outside = !active || active === container || !container.contains(active);

  if (event.shiftKey && (outside || active === first)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (outside || active === last)) {
    event.preventDefault();
    first.focus();
  }
}
