import { TestBed } from '@angular/core/testing';

import { GradingScaleService } from './grading-scale.service';

describe('GradingScaleService', () => {
  let service: GradingScaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GradingScaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
