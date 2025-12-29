import { TestBed } from '@angular/core/testing';

import { ReceiptHeaderListService } from './receipt-header-list.service';

describe('ReceiptHeaderListService', () => {
  let service: ReceiptHeaderListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptHeaderListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
