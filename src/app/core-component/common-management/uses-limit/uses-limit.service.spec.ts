import { TestBed } from '@angular/core/testing';

import { UsesLimitService } from './uses-limit.service';

describe('UsesLimitService', () => {
  let service: UsesLimitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsesLimitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
