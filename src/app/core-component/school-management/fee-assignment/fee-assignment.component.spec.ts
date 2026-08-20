import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeAssignmentComponent } from './fee-assignment.component';

describe('FeeAssignmentComponent', () => {
  let component: FeeAssignmentComponent;
  let fixture: ComponentFixture<FeeAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeAssignmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeeAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
