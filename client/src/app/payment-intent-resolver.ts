import { ResolveFn } from '@angular/router';

export const paymentIntentResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
