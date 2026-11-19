import { Component, inject, signal } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { RegisterData } from '../../../shared/models/user.model';
import { email, form, FormField, required } from '@angular/forms/signals';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TextFieldComponent } from '../../../shared/text-field/text-field.component';

@Component({
  selector: 'app-register',
  imports: [
    MatCard,
    MatButton,  
    TextFieldComponent
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  private accountService = inject(AccountService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  protected loading = signal(false);

  // Signal contenant les messages d'erreur de validation renvoyés par le serveur
  protected validationErrors = signal<string[]>([]);

  // Modèle réactif du formulaire d'inscription sous forme de signal
  private registerModel = signal<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });


  // Configuration du formulaire de signaux avec règles de validation par chemin
  protected registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.firstName, { message: 'First name is required' });
    required(schemaPath.lastName, { message: 'Last name is required' });
    required(schemaPath.email, { message: "Email is required" });
    email(schemaPath.email, { message: "Email is invalid" });
    required(schemaPath.password, { message: 'Password is required' });
  });

  protected onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.validationErrors.set([]); // Réinitialise les erreurs précédentes à chaque nouvelle tentative
    this.accountService.register(this.registerModel()).subscribe({
      next: () => {
        this.snackbar.success('Registration successful - you can now login!');
        void this.router.navigateByUrl('/account/login');
      },
      error: (err) => {
        // Réactive le bouton en cas d'erreur afin que l'utilisateur puisse corriger ses champs
        this.loading.set(false);
        if (Array.isArray(err)) {
          this.validationErrors.set(err);
        }
      }
    });
  }
}
