import { DestroyRef, Directive, ElementRef, Renderer2, inject, output } from '@angular/core';

/** Desplazamiento horizontal mínimo (px) para que el gesto cuente como swipe. */
const SWIPE_THRESHOLD = 40;

/**
 * Detecta swipes horizontales táctiles sobre el host y emite hacia dónde navegar:
 * `1` (el dedo va a la izquierda → foto siguiente) o `-1` (a la derecha → anterior).
 *
 * Ignora gestos mayormente verticales, multitouch (pinch) y el paneo cuando la página tiene zoom.
 * Los listeners se registran `passive` con Renderer2 (los bindings `(touchstart)` del template
 * no pueden declararlo), así nunca bloquean el scroll ni el zoom nativos.
 */
@Directive({ selector: '[appSwipe]' })
export class Swipe {
  readonly swiped = output<1 | -1>();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    const passive = { passive: true };
    let start: { x: number; y: number } | null = null;

    const unlisten = [
      renderer.listen(
        el,
        'touchstart',
        (e: TouchEvent) => {
          const t = e.touches[0];
          start = e.touches.length === 1 && t ? { x: t.clientX, y: t.clientY } : null;
        },
        passive,
      ),
      renderer.listen(
        el,
        'touchend',
        (e: TouchEvent) => {
          const from = start;
          const t = e.changedTouches[0];
          start = null;
          if (!from || !t || e.touches.length > 0 || isZoomed(el)) return;

          const dx = t.clientX - from.x;
          const dy = t.clientY - from.y;
          if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            this.swiped.emit(dx < 0 ? 1 : -1);
          }
        },
        passive,
      ),
      renderer.listen(
        el,
        'touchcancel',
        () => {
          start = null;
        },
        passive,
      ),
    ];

    inject(DestroyRef).onDestroy(() => unlisten.forEach((off) => off()));
  }
}

/** Con pinch-zoom activo el arrastre es para recorrer la foto, no para cambiarla. */
const isZoomed = (el: HTMLElement): boolean =>
  (el.ownerDocument.defaultView?.visualViewport?.scale ?? 1) > 1.01;
