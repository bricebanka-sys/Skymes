import { Component, inject, input, output } from '@angular/core';
import { BusyService } from '../../core/services/busy.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    MatIcon,
    MatButton
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {

  protected busyService = inject(BusyService);

  public message = input.required<string>();
  public icon = input.required<string>();
  public actionText = input.required<string>();

  public action = output<void>();

  onAction() {
    this.action.emit();
  }
}
