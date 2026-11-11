import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { ActivatedRoute } from '@angular/router';
import { ShopService } from '../../../core/services/shop.service';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatDivider,
    CurrencyPipe,
    MatLabel,
    FormsModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {

  private shopService = inject(ShopService);
  private activatedRoute = inject(ActivatedRoute);
  private cartService = inject(CartService);

  product?: Product;
  quantity = 1;
  quantityInCart = 0;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (!id) return;

    // Conversion de l'ID string en number à l'aide du symbole '+'
    this.shopService.getProduct(+id).subscribe({
      next: product => { 
        this.product = product; 
        this.updateQuantityInCart(); },
      error: (error) => console.error(error)
    });
  }



  // Met à jour le panier en calculant la différence (ajout ou suppression d'articles)
  updateCart() {
    if (!this.product) return;

    if (this.quantity > this.quantityInCart) {
      const itemsToAdd = this.quantity - this.quantityInCart;
      this.quantityInCart += itemsToAdd;
      this.cartService.addItemToCart(this.product, itemsToAdd);
    } else if (this.quantity < this.quantityInCart) {
      const itemsToRemove = this.quantityInCart - this.quantity;
      this.quantityInCart -= itemsToRemove;
      this.cartService.removeItemFromCart(this.product.id, itemsToRemove);
    }
  }


  // Met à jour la quantité locale en fonction de ce qui se trouve déjà dans le panier
  updateQuantityInCart() {
    if (!this.product) return;

    const cart = this.cartService.cart();
    const item = cart?.items.find(x => x.productId === this.product?.id);
    
    this.quantityInCart = item ? item.quantity : 0;
    this.quantity = this.quantityInCart > 0 ? this.quantityInCart : 1;
  }

  // Détermine dynamiquement le texte du bouton d'action
  getButtonText(): string {
    return this.quantityInCart > 0 ? 'Update cart' : 'Add to Cart';
  }
}
