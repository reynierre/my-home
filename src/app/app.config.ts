import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { providePhotoLoader } from './core/photo-loader';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Sin `withInMemoryScrolling({ anchorScrolling })`: los links `#la-casa`/`#fotos` son anclas
    // nativas. El scroll del router (ViewportScroller.scrollToAnchor) ignora `scroll-margin-top`
    // y dejaba el inicio de la sección debajo del header sticky.
    provideRouter(routes),
    // v22: incremental hydration + event replay vienen activados por defecto
    provideClientHydration(),
    providePhotoLoader(),
  ],
};
