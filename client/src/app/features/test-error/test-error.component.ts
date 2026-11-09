import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-test-error',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './test-error.component.html',
  styleUrl: './test-error.component.scss',
})
export class TestErrorComponent {

  private http = inject(HttpClient);
  baseUrl = 'https://localhost:5001/api/';
  validationErrors?: string[]; // Tableau pour stocker les erreurs de validation

  get404Error() {
    this.http.get(this.baseUrl + 'buggy/notfound').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get400Error() {
    this.http.get(this.baseUrl + 'buggy/badrequest').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get401Error() {
    this.http.get(this.baseUrl + 'buggy/unauthorized').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get500Error() {
    this.http.get(this.baseUrl + 'buggy/internalerror').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get400ValidationError() {
    // Utilisation d'une requête POST avec un corps vide pour déclencher une erreur de validation
    this.http.post(this.baseUrl + 'buggy/validationerror', {}).subscribe({
      next: (response) => console.log(response),
      error: (error) => this.validationErrors = error // Récupération des erreurs émises par l'intercepteur
    });
  }
}
