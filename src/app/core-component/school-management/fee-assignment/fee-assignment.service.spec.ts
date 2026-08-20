import { TestBed } from '@angular/core/testing';

import { FeeAssignmentService } from './fee-assignment.service';

describe('FeeAssignmentService', () => {
  let service: FeeAssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeeAssignmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
