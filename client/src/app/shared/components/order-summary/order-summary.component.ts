import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyPipe, Location } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [
    MatButton,
    MatFormField, 
    MatLabel,
    RouterLink, 
    MatInput,
    CurrencyPipe
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {

  cartService = inject(CartService);
  protected location = inject(Location);
  private router = inject(Router);
  protected loading = signal(false);


  protected async onCheckout() {
    this.loading.set(true);
    try {
      await this.router.navigateByUrl('/checkout');
    } finally {
      this.loading.set(false);
    }
  }
}
