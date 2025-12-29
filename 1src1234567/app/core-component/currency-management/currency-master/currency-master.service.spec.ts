import { TestBed } from '@angular/core/testing';

import { CurrencyMasterService } from './currency-master.service';

describe('CurrencyMasterService', () => {
  let service: CurrencyMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
