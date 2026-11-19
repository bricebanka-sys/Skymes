import { Component, inject } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { CartItemComponent } from './cart-item/cart-item.component';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CartItemComponent,
    OrderSummaryComponent,
    EmptyStateComponent
],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  cartService = inject(CartService);
  private router = inject(Router);

  protected onAction() {
  void this.router.navigateByUrl('/shop');
}
}
