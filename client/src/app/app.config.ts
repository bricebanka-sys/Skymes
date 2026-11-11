import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import "zone.js"

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { InitService } from './core/services/init.service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

import { LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/de';


// function initializeApp(initService: InitService) {
//   return () => lastValueFrom(initService.init()).finally(() => {
//     // Suppression de l'écran de chargement initial une fois l'initialisation terminée
//     const splash = document.getElementById('initial-splash');
//     if (splash) {
//       splash.remove();
//     }
//   })
// }

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(), // Enregistrement du client HTTP
    provideHttpClient(withInterceptors([errorInterceptor, loadingInterceptor])), // Enregistrement de l'intercepteur global

    { provide: LOCALE_ID, useValue: 'de-DE' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
    provideAppInitializer(async () => {
      const initService = inject(InitService);
      try {
        await lastValueFrom(initService.init());
      } finally {
        // Suppression de l'écran de chargement initial une fois l'initialisation terminée
        const splash = document.getElementById('initial-splash');
        if (splash) {
          splash.remove();
        }
      }
    })

  ]
};
