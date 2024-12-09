import { TestBed } from '@angular/core/testing';

import { PaymentModeMasterService } from './payment-mode-master.service';

describe('PaymentModeMasterService', () => {
  let service: PaymentModeMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentModeMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
