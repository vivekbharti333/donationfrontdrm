import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExamResultComponent } from './student-exam-result.component';

describe('StudentExamResultComponent', () => {
  let component: StudentExamResultComponent;
  let fixture: ComponentFixture<StudentExamResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamResultComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentExamResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
