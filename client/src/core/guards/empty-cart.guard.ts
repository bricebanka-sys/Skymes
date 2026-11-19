import { inject } from "@angular/core";
import { CanActivateFn, RedirectCommand, Router } from "@angular/router";
import { CartService } from "../../app/core/services/cart.service";
import { SnackbarService } from "../../app/core/services/snackbar.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { filter, firstValueFrom, of } from "rxjs";




export const emptyCartGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  const cart = cartService.cart();
  const itemCount = cartService.itemCount();

  if (!cart || !cart.items || cart.items.length === 0 || itemCount === 0) {
    snackbar.error('Your cart is empty');
    return new RedirectCommand(router.parseUrl('/cart'));
  }

  return true;
};