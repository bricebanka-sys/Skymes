import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../shared/models/cart';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [

    MatButton,
    MatIcon,
    RouterLink,
    CurrencyPipe,
    MatIconButton
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {

  // Signal d'entrée obligatoire requis par Angular
  item = input.required<CartItem>();
  cartService = inject(CartService);


  // Incrémenter la quantité d'un article (+1)
  incrementQuantity() {
    this.cartService.addItemToCart(this.item());
  }

  // Décrémenter la quantité d'un article (-1)
  decrementQuantity() {
    this.cartService.removeItemFromCart(this.item().productId, 1);
  }

  // Supprimer entièrement l'article du panier
  removeCartItem() {
    this.cartService.removeItemFromCart(this.item().productId, this.item().quantity);
  }
}
