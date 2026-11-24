import { afterRenderEffect, Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatStepper, MatStep, StepperOrientation, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StripeService } from '../../core/services/stripe.service';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user.model';
import { AccountService } from '../../core/services/account.service';
import { firstValueFrom } from 'rxjs';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { CheckoutReviewComponent } from './checkout-review/checkout-review.component';
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { SnackbarService } from '../../core/services/snackbar.service';
import { StripeAddressElement, StripeError, StripePaymentElement } from '@stripe/stripe-js';



export enum CheckoutStep {
  Address = 0,
  Shipping = 1,
  Payment = 2,
  Review = 3
}
@Component({
  selector: 'app-checkout',
  imports: [
    MatStepper,
    MatStep,
    CurrencyPipe,
    RouterLink,
    MatButton,
    MatStepperNext,
    MatStepperPrevious,
    MatCheckbox,
    OrderSummaryComponent,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {

  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);
  private stripeService = inject(StripeService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  protected saveAddress = signal(false);
  private accountService = inject(AccountService);
  protected cartService = inject(CartService);
  protected addressComplete = signal(false);
  protected deliveryComplete = signal(false);
  protected paymentComplete = signal(false);
  protected processing = signal(false);

  protected checkoutComplete = computed(
    () => this.addressComplete() && this.deliveryComplete() && this.paymentComplete()
  );
  // private addressContainer = viewChild<ElementRef<HTMLDivElement>>('addressElement');

  protected stepperOrientation = signal<StepperOrientation>('horizontal');

  // Éléments Stripe actuellement montés : permet de détecter un élément remplacé
  private mountedAddressEl?: StripeAddressElement;
  private mountedPaymentEl?: StripePaymentElement;


  constructor() {
    this.breakpointObserver
      .observe('(max-width: 639.98px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.stepperOrientation.set(result.matches ? 'vertical' : 'horizontal');
      });


      // Observation réactive de deliveryComplete si exposé via un signal / modèle dans le composant ou le service
      effect(() => {
        // Synchronise l'état d'achèvement de l'étape Shipping lorsque deliveryComplete évolue
        this.deliveryComplete;
      });

      afterRenderEffect(() => {
        // Lu pour que l'effet se relance quand le stepper reconstruit son contenu
        this.stepperOrientation();

        const addressEl = this.stripeService.addressElementResource?.value();
        const container = document.getElementById('address-element');

        // Monte si le conteneur est vide OU si l'élément a été remplacé par une nouvelle instance
        if (addressEl && container && (container.childElementCount === 0 || this.mountedAddressEl !== addressEl)) {
          const isNewElement = this.mountedAddressEl !== addressEl;

          // Détache l'ancien élément et supprime toute iframe orpheline avant de remonter
          try {
            this.mountedAddressEl?.unmount();
          } catch {
            // Rien à détacher
          }
          try {
            addressEl.unmount();
          } catch {
            // Pas encore monté : rien à détacher
          }
          container.replaceChildren();

          addressEl.mount('#address-element');
          this.mountedAddressEl = addressEl;

          // Écoute l'événement change de l'élément d'adresse Stripe pour sécuriser l'étape Adresse
          // (une seule fois par élément, pour éviter les écouteurs en double)
          if (isNewElement) {
            addressEl.on('change', (event) => {
              this.addressComplete.set(event.complete);
            });
          }
        }

        const paymentEl = this.stripeService.paymentElementResource?.value();
        const paymentContainer = document.getElementById('payment-element');

        if (paymentEl && paymentContainer && (paymentContainer.childElementCount === 0 || this.mountedPaymentEl !== paymentEl)) {
          const isNewElement = this.mountedPaymentEl !== paymentEl;

          // Détache l'ancien élément et supprime toute iframe orpheline avant de remonter
          try {
            this.mountedPaymentEl?.unmount();
          } catch {
            // Rien à détacher
          }
          try {
            paymentEl.unmount();
          } catch {
            // Pas encore monté : rien à détacher
          }
          paymentContainer.replaceChildren();

          paymentEl.mount('#payment-element');
          this.mountedPaymentEl = paymentEl;

          // Écoute l'événement change de l'élément de paiement Stripe pour sécuriser l'étape Payment
          if (isNewElement) {
            paymentEl.on('change', (event) => {
              this.paymentComplete.set(event.complete);
            });
          }
        }
      });
  }

  private creatingToken = false;

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === CheckoutStep.Shipping && this.saveAddress()) {
      const address = await this.getAddressFromStripeAddress();

      if (address) {
        await firstValueFrom(this.accountService.updateAddress(address));
      }
    }

    if (event.selectedIndex === CheckoutStep.Review) {
      try {
        const result = await this.stripeService.createConfirmationToken();

        if (!result) {
          this.snackbar.error('Payment form is not ready. Please check the Payment step.');
          return;
        }

        if ('error' in result && result.error) {
          this.snackbar.error(result.error.message ?? 'Invalid payment details');
        }
      } catch (error) {
        // Stripe lève directement une IntegrationError si aucun élément n'est monté
        console.error('Confirmation token error:', error);
        this.snackbar.error('Unable to prepare the payment summary. Please check the Payment step.');
      }
    }
  }



  protected async onConfirmPayment(stepper: MatStepper) {
    this.processing.set(true);
    try {
      const result = await this.stripeService.confirmPayment();

      if (!result) {
        this.snackbar.error('Payment session is not ready. Please review your details.');
        stepper.previous();
        return;
      }

      if (result.error) {
        throw result.error;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        this.stripeService.confirmationToken.set(undefined);
        this.cartService.deleteCart();
        this.snackbar.success('Payment succeeded');
        await this.router.navigateByUrl('/');
        return;
      }

      if (result.paymentIntent?.status === 'processing') {
        this.snackbar.success('Payment is processing.');
        return;
      }

      this.snackbar.error('Payment was not completed. Please try again.');
      stepper.previous();
    } catch (error) {
      const message =
        (error as StripeError)?.message ?? 'Payment could not be processed';
      this.snackbar.error(message);
      stepper.previous();
    } finally {
      this.processing.set(false);
    }
  }


  private async getAddressFromStripeAddress(): Promise<Address | null> {
    const addressElement = this.stripeService.addressElementResource.value();
    if (!addressElement) return null;

    const result = await addressElement?.getValue();
    const address = result.value?.address;

    if (!address) return null;

    return {
      line1: address.line1 ?? '',
      line2: address.line2 || undefined,
      city: address.city ?? '',
      state: address.state ?? '',
      country: address.country ?? '',
      postalCode: address.postal_code ?? ''
    };

  }
}