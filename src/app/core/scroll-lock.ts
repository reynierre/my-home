/**
 * Bloquea el scroll del documento mientras hay un overlay abierto y devuelve la función que
 * restaura el estado anterior. Compensa el ancho de la barra de scroll con `padding-right` en el
 * body para que el contenido no "salte" cuando la barra desaparece.
 *
 * Solo browser: llamar desde `afterNextRender`, `afterRenderEffect` o un listener de eventos.
 * Los bloqueos anidados funcionan si se liberan en orden inverso (cada uno restaura lo que vio).
 */
export function lockDocumentScroll(doc: Document): () => void {
  const html = doc.documentElement;
  const body = doc.body;
  const win = doc.defaultView;

  const previous = { overflow: html.style.overflow, paddingRight: body.style.paddingRight };
  const scrollbarWidth = win ? win.innerWidth - html.clientWidth : 0;

  if (win && scrollbarWidth > 0) {
    const currentPadding = parseFloat(win.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
  html.style.overflow = 'hidden';

  return () => {
    html.style.overflow = previous.overflow;
    body.style.paddingRight = previous.paddingRight;
  };
}
