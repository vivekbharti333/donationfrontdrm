import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeSubjectComponent } from './grade-subject.component';

describe('GradeSubjectComponent', () => {
  let component: GradeSubjectComponent;
  let fixture: ComponentFixture<GradeSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GradeSubjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradeSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
