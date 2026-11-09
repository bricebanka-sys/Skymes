import { HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../services/busy.service';
import { inject } from '@angular/core/primitives/di';
import { finalize } from 'rxjs/internal/operators/finalize';
import { delay } from 'rxjs/internal/operators/delay';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const busyService = inject(BusyService);

  // Activation de l'indicateur de chargement au début de la requête
  busyService.busy();
  return next(req).pipe(

    delay(500), // Simulation d'une latence réseau de 500 ms
    finalize(() => {
      // Désactivation de l'indicateur lorsque la requête est terminée (succès ou erreur)
      busyService.idle();
    })
  );
};
