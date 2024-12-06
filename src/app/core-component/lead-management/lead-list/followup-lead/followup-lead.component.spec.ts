import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupLeadComponent } from './followup-lead.component';

describe('FollowupLeadComponent', () => {
  let component: FollowupLeadComponent;
  let fixture: ComponentFixture<FollowupLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FollowupLeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowupLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
