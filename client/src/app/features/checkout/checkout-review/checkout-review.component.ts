import { Component, computed, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { StripeService } from '../../../core/services/stripe.service';

@Component({
  selector: 'app-checkout-review',
  standalone: true,
  imports: [
    CurrencyPipe,
  ],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.scss',
})
export class CheckoutReviewComponent {
  protected cartService = inject(CartService);
  protected stripeService = inject(StripeService);

  protected confirmationToken = this.stripeService.confirmationToken;
  protected shippingAddress = computed(() => this.confirmationToken()?.shipping?.address ?? null);
  protected shippingName = computed(() => this.confirmationToken()?.shipping?.name ?? '');
  protected cardPreview = computed(() => this.confirmationToken()?.payment_method_preview?.card ?? null);
}
