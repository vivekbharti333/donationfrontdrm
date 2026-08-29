import { TestBed } from '@angular/core/testing';

import { StudentExamMarksService } from './student-exam-marks.service';

describe('StudentExamMarksService', () => {
  let service: StudentExamMarksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentExamMarksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
