import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExamMarksComponent } from './student-exam-marks.component';

describe('StudentExamMarksComponent', () => {
  let component: StudentExamMarksComponent;
  let fixture: ComponentFixture<StudentExamMarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamMarksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentExamMarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
