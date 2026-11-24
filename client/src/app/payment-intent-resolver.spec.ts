import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { paymentIntentResolver } from './payment-intent-resolver';

describe('paymentIntentResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => paymentIntentResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
