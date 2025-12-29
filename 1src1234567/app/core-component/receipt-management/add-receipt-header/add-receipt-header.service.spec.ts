import { TestBed } from '@angular/core/testing';

import { AddReceiptHeaderService } from './add-receipt-header.service';

describe('AddReceiptHeaderService', () => {
  let service: AddReceiptHeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddReceiptHeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
