import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { CartService } from './cart.service';
import { environment } from '../../../environments/environment';
import { ConfirmationToken, loadStripe, PaymentIntent, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElements, StripeError, StripePaymentElement, StripePaymentElementOptions } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { Cart } from '../../shared/models/cart';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class StripeService {

  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private baseUrl = environment.apiUrl;
  private accountService = inject(AccountService);

  public confirmationToken = signal<ConfirmationToken | undefined>(undefined);

  private stripeResource = resource<Stripe | null, unknown>({
    loader: async () => {
      return await loadStripe(environment.stripePublicKey);
    }
  });

  addressElement = signal<StripeAddressElement | undefined>(undefined);
  paymentElement = signal<StripePaymentElement | undefined>(undefined);

  private elementsParams = computed(
    () => {
      const stripe = this.stripeResource.value();
      const clientSecret = this.cartService.cart()?.clientSecret;

      if (!stripe || !clientSecret) {
        return undefined;
      }

      return { stripe, clientSecret };
    },
    {
      // Évite de recréer StripeElements à chaque mise à jour du panier :
      // seule une vraie nouvelle valeur (Stripe ou clientSecret) relance la ressource
      equal: (a, b) => a?.stripe === b?.stripe && a?.clientSecret === b?.clientSecret,
    }
  );

  // Instance unique partagée de StripeElements pour addressElementResource et paymentElementResource
  public elementsResource = resource<StripeElements | undefined, { stripe: Stripe; clientSecret: string } | undefined>({
    params: () => this.elementsParams(),
    loader: async ({ params }) => {
      return params.stripe.elements({
        clientSecret: params.clientSecret,
        locale: 'en', // Force l'anglais pour tous les libellés et champs Stripe
        appearance: {
          labels: 'floating'
        }
      });
    }
  });

  public addressElementResource = resource({
    params: () => {
      const elements = this.elementsResource.value();
      const user = this.accountService.currentUser();

      if (!elements) {
        return undefined;
      }

      return { elements, user };
    },
    loader: async ({ params }) => {
      const user = params.user;
      const fullName = user
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
        : '';

      const options: StripeAddressElementOptions = {
        mode: 'shipping',
        defaultValues: {
          name: fullName || undefined,
          address: {
            line1: user?.address?.line1 ?? '',
            line2: user?.address?.line2 ?? '',
            city: user?.address?.city ?? '',
            state: user?.address?.state ?? '',
            postal_code: user?.address?.postalCode ?? '',
            country: user?.address?.country || 'DE' // Allemagne par défaut (code ISO 3166-1 alpha-2)
          }
        }
      };

      // Réutilise l'élément existant : Stripe n'autorise qu'un seul Address Element par instance
      const addressEl =
        params.elements.getElement('address') ?? params.elements.create('address', options);
      this.addressElement.set(addressEl);
      return addressEl;
    }
  });


  public paymentElementResource = resource<
    StripePaymentElement | undefined,
    { elements: StripeElements } | undefined
  >({
    params: () => {
      const elements = this.elementsResource.value();
      if (!elements) {
        return undefined;
      }
      return { elements };
    },
    loader: async ({ params }) => {
      if (!params) {
        return undefined;
      }

      const options: StripePaymentElementOptions = {
        layout: {
          type: 'tabs'
        },
        wallets: {
          applePay: 'never',
          googlePay: 'never'
        }
      };

      // Réutilise l'élément existant : Stripe n'autorise qu'un seul Payment Element par instance
      const paymentEl =
        params.elements.getElement('payment') ?? params.elements.create('payment', options);
      this.paymentElement.set(paymentEl);
      return paymentEl;
    }
  });


  public async createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) {
      throw new Error('Problem with Cart');
    }

    const updatedCart = await firstValueFrom(
      this.http.post<Cart>(`${this.baseUrl}payments/${cart.id}`, {})
    );

      this.cartService.cart.set(updatedCart);

    return updatedCart;
  }


  public async createConfirmationToken() {
    const stripe = this.elementsParams()?.stripe;
    const clientSecret = this.cartService.cart()?.clientSecret;
    const elements = this.elementsResource.value();
    const paymentEl = this.paymentElement();
    const paymentContainer = document.getElementById('payment-element');

    if (!stripe || !clientSecret || !elements || !paymentEl || !paymentContainer) {
      this.confirmationToken.set(undefined);
      return null;
    }

    const submitResult = await elements.submit();
    if (submitResult.error) {
      this.confirmationToken.set(undefined);
      return submitResult;
    }

    const result = await stripe.createConfirmationToken({ elements });
    if (result.error) {
      this.confirmationToken.set(undefined);
      return result;
    }

    this.confirmationToken.set(result.confirmationToken);
    return result;
  }


  public async confirmPayment(): Promise<{
  error?: StripeError;
  paymentIntent?: PaymentIntent;
  } | null> {
    const params = this.elementsParams();
    const clientSecret = this.cartService.cart()?.clientSecret ?? params?.clientSecret;
    const elements = this.elementsResource.value();
    const tokenId = this.confirmationToken()?.id;
    const paymentEl = this.paymentElement();
    const paymentContainer = document.getElementById('payment-element');

    if (!params || !clientSecret || !elements || !tokenId || !paymentEl || !paymentContainer) {
      return null;
    }

    const submitResult = await elements.submit();
    if (submitResult.error) {
      return { error: submitResult.error };
    }

    const result = await params.stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        confirmation_token: tokenId
      },
      redirect: 'if_required'
    });

    if (result.error) {
      return { error: result.error };
    }

    return { paymentIntent: result.paymentIntent };
  }



}



