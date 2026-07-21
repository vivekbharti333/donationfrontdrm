import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { successGuard } from './success.guard';

describe('successGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => successGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
