import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAcademicComponent } from './student-academic.component';

describe('StudentAcademicComponent', () => {
  let component: StudentAcademicComponent;
  let fixture: ComponentFixture<StudentAcademicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAcademicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentAcademicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
