import { TestBed } from '@angular/core/testing';

import { DownloadReceiptService } from './download-receipt.service';

describe('DownloadReceiptService', () => {
  let service: DownloadReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
