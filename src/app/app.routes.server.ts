import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // La landing se genera en build (SSG): HTML estático completo, TTFB mínimo.
  { path: '', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server, status: 301, headers: { Location: '/' } },
];
