import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedLeadComponent } from './assigned-lead.component';

describe('AssignedLeadComponent', () => {
  let component: AssignedLeadComponent;
  let fixture: ComponentFixture<AssignedLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignedLeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignedLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
