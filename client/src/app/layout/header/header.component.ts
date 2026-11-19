import { Component, inject } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BusyService } from '../../core/services/busy.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CartService } from '../../core/services/cart.service';
import { AccountService } from '../../core/services/account.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    MatBadge,
    RouterLink,
    RouterLinkActive,
    MatProgressBar,
    MatMenuTrigger,
    MatMenu,
    MatDivider
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected busyService = inject(BusyService);
  protected cartService = inject(CartService);
  // Injection du service de compte et du routeur en mode protégé (accessible dans le HTML)
  protected accountService = inject(AccountService);
  protected snackbar = inject(SnackbarService);
  private router = inject(Router);

  // Vérifie si le panier est vide avant d'ouvrir la page /cart
  protected onCartClick(): void {
    const cart = this.cartService.cart();
    const itemCount = this.cartService.itemCount();

    if (!cart || !cart.items || cart.items.length === 0 || itemCount === 0) {
      this.snackbar.error('Your cart is empty');
      return;
    }

    void this.router.navigate(['/cart']);
  }

  // Fonction de déconnexion
  protected logout() {
    this.accountService.logout().subscribe({
      next: () => {
        // Réinitialise la ressource utilisateur et redirige vers la page d'accueil
        this.accountService.userResource.set(undefined as any);
        void this.router.navigateByUrl('/');
      }
    });
  }
}
