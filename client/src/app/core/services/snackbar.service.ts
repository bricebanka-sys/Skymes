import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root',
})
export class SnackbarService {

  private snackBar = inject(MatSnackBar);

  error(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snack-error'] // Classe CSS personnalisée pour le style d'erreur
    });
  }

  success(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snack-success'] // Classe CSS personnalisée pour le style de succès
    });
  }
}
