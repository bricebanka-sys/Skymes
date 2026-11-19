import { Component, inject, signal } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { LoginData } from '../../../shared/models/user.model';
import { form } from '@angular/forms/signals'; // API moderne des formulaires à base de signaux
import { Router } from '@angular/router';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormField } from '@angular/forms/signals'; // (ou le nom exact fourni par sa bibliothèque)

@Component({
  selector: 'app-login',
  imports: [
    MatCard,
    MatFormField,
    MatInput,
    MatButton,
    FormField,
    MatLabel
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {

  private accountService = inject(AccountService);
  private router = inject(Router);

  // Indicateur de chargement sous forme de signal
  protected loading = signal(false);

  private redirectUrl = this.router.currentNavigation()?.extras?.state?.["attemptedUrl"] ?? '/shop';

  // Modèle initialisé sous forme de signal
  protected loginModel = signal<LoginData>({
    email: '',
    password: ''
  });

  // Liaison du formulaire aux signaux (Signal Forms)
  protected loginForm = form(this.loginModel);

  // Gestion de la soumission du formulaire
  protected onSubmit(event: Event) {
    event.preventDefault(); // Empêche le rechargement natif de la page
    this.loading.set(true);

    this.accountService.login(this.loginModel()).subscribe({
      next: () => {

        this.loading.set(false)
        // Recharge les informations utilisateur et redirige vers la boutique
        this.accountService.userResource.reload();
        void this.router.navigateByUrl(this.redirectUrl);
      },
      // Désactive le chargement pour permettre à l'utilisateur de corriger ses identifiants et réessayer
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
