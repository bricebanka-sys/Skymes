import { Component, input } from '@angular/core';
import { Field, FormField } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-text-field',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    FormField   
  ],
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss',
})
export class TextFieldComponent<T extends string | number | boolean | Date | null = string> {

  // Champ lié au Signal Form (obligatoire, typé génériquement)
  public field = input.required<Field<T, string | number>>();

  // Libellé affiché au-dessus du champ (obligatoire)
  public label = input.required<string>();

  // Type HTML du champ ('text' par défaut, 'email', 'password', etc.)
  public type = input<string>('text');
  
  // Texte indicatif (placeholder)
  public placeholder = input<string>('');
}
