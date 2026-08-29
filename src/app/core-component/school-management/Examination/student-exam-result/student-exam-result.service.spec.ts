import { TestBed } from '@angular/core/testing';

import { StudentExamResultService } from './student-exam-result.service';

describe('StudentExamResultService', () => {
  let service: StudentExamResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentExamResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
