import { Component, effect, inject, output } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { StripeService } from '../../../core/services/stripe.service';
import { DeliveryMethod } from '../../../shared/models/delivery.model';
import { Cart } from '../../../shared/models/cart';

@Component({
  selector: 'app-checkout-delivery',
  imports: [
    CurrencyPipe,
    MatRadioModule
  ],
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.scss',
})
export class CheckoutDeliveryComponent {

  protected checkoutService = inject(CheckoutService);
  protected cartService = inject(CartService);
  private stripeService = inject(StripeService);

  public deliveryComplete = output<boolean>();

  constructor() {
    effect(() => {
      const hasDeliveryMethod = !!this.cartService.cart()?.deliveryMethodId;
      this.deliveryComplete.emit(hasDeliveryMethod);
    });
  }


  async updateDeliveryMethod(event: MatRadioChange<DeliveryMethod>) {
    const currentCart = this.cartService.cart();
    if (!currentCart || !event.value) return;

    const updatedCart: Cart = {
      ...currentCart,
      deliveryMethodId: event.value.id,
    };

    await this.cartService.setCart(updatedCart);
    await this.stripeService.createOrUpdatePaymentIntent();
  }
}
