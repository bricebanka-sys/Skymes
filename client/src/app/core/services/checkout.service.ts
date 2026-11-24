import { computed, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { httpResource } from '@angular/common/http';
import { DeliveryMethod } from '../../shared/models/delivery.model';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {

  private baseUrl = environment.apiUrl;

  readonly deliveryResource = httpResource<DeliveryMethod[]>(
    () => `${this.baseUrl}payments/delivery-methods`
  );

  public deliveryMethods = computed(() => {
    const methods = this.deliveryResource.value() ?? [];
    return [...methods].sort((a, b) => a.price - b.price);
  });
  
}
