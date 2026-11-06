import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import "zone.js"

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(), // Enregistrement du client HTTP

    // Correction pour restaurer correctement le focus et éviter les avertissements aria-hidden
    // {
    //   provide: MAT_DIALOG_DEFAULT_OPTIONS,
    //   useValue: { hasBackdrop: true, autofocus: 'dialog', restoreFocus: true }
    // }
  ]
};
