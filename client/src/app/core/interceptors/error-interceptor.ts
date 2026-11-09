import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { throwError, catchError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    
    catchError((error: HttpErrorResponse) => {
      // Gestion des erreurs selon le code de statut HTTP
      if (error.status === 400) {
        if (error.error.errors) {
          // Erreur de validation
          const modelStateErrors = [];
          for (const key in error.error.errors) {
            if (error.error.errors[key]) {
              modelStateErrors.push(error.error.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        } else {
          // Mauvaise requête simple (Bad Request)
          snackbar.error(error.error.title || error.error);
        }
      }

      if (error.status === 401) {
        snackbar.error(error.error.message || 'Unauthorized');
      }

      if (error.status === 404) {
        router.navigateByUrl('/not-found');
      }

      if (error.status === 500) {
        // Transmission de l'erreur via l'état de navigation
        const navigationExtras: NavigationExtras = { state: { error: error.error } };
        router.navigateByUrl('/server-error', navigationExtras);
      }

      // Utilisation d'une fonction usine pour propager l'erreur RxJS (recommandé pour les versions actuelles d'Angular)
      return throwError(() => error);
    })
  );
  
};
