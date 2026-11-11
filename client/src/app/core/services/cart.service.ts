import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Signal réactif pour stocker le panier (initialement null)
  cart = signal<Cart | null>(null);

  // Signal calculé pour obtenir le nombre total d'articles dans le panier
  itemCount = computed(() => {
    const cart = this.cart();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  });



  // Signal calculé pour évaluer les totaux financiers du panier
  totals = computed(() => {
    const cart = this.cart();
    if (!cart) return null;

    // Calcul du sous-total via la méthode reduce
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Frais de livraison forfaitaires (ou gratuits au-delà d'un certain montant)
    const shipping = subtotal > 0 ? 10 : 0; 
    
    // Réduction (fixée à 0 pour l'instant)
    const discount = 0; 

    const total = subtotal + shipping - discount;

    return {
      subtotal,
      shipping,
      discount,
      total
    };
  });

  // Récupération d'un panier par son ID depuis l'API
  getCart(id: string) {
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).pipe(
      map(cart => {
        this.cart.set(cart);
        return cart;
      })
    );   
  }

  // Enregistrement ou mise à jour du panier sur le serveur et mise à jour du signal
  setCart(cart: Cart) {
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).subscribe({
      next: (response) => this.cart.set(response)
    });
  }


  // Ajout d'un article au panier (gère à la fois un Product et un CartItem)
  addItemToCart(item: CartItem | Product, quantity = 1) {
    let cart = this.cart();
    
    // Si aucun panier n'existe en mémoire, on en crée un nouveau
    if (!cart) {
      cart = this.createCart();
    }

    // Si l'élément passé est un Product, on le convertit en CartItem grâce au garde de type
    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }

    // Ajout ou mise à jour de la quantité de l'article dans le panier
    cart.items = this.addOrUpdateItem(cart.items, item, quantity);

    // Enregistrement des modifications sur le serveur via l'API
    this.setCart(cart);
  }


  // Supprimer ou décrémenter un article du panier
  removeItemFromCart(productId: number, quantity = 1) {
    const cart = this.cart();
    if (!cart) return;

    const index = cart.items.findIndex(x => x.productId === productId);
    if (index === -1) return;

    // Si la quantité actuelle est supérieure à la quantité à retirer, on décrémente
    if (cart.items[index].quantity > quantity) {
      cart.items[index].quantity -= quantity;
    } else {
      // Sinon, on supprime complètement l'article du tableau
      cart.items.splice(index, 1);
    }

    // Si le panier est entièrement vide après cette action, on le supprime
    if (cart.items.length === 0) {
      this.deleteCart();
    } else {
      // Sinon, on met à jour le panier sur le serveur et dans le signal
      this.setCart(cart);
    }
  }

  // Suppression complète du panier (côté serveur et nettoyage du LocalStorage)
  deleteCart() {
    const cart = this.cart();
    if (!cart) return;

    this.http.delete(this.baseUrl + 'cart?id=' + cart.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      }
    });
  }

  

  // Logique d'ajout ou d'incrémentation de la quantité d'un article dans la liste
  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
    const index = items.findIndex(x => x.productId === item.productId);
    if (index === -1) {
      item.quantity = quantity;
      items.push(item);
    } else {
      items[index].quantity += quantity;
    }
    return items;
  }

  // Conversion d'un objet Product en CartItem
  private mapProductToCartItem(item: Product): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0, // La quantité sera définie par la suite
      pictureUrl: item.pictureUrl,
      brand: item.brand,
      type: item.type
    };
  }

  // Création d'un nouveau panier et sauvegarde de son ID dans le LocalStorage du navigateur
  private createCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }

  // Garde de type TypeScript : vérifie si l'objet reçu est un Product (possède un 'id') ou un CartItem (possède un 'productId')
  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

}
