import { TestBed } from '@angular/core/testing';

import { ProgramManagementService } from './program-management.service';

describe('ProgramManagementService', () => {
  let service: ProgramManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
