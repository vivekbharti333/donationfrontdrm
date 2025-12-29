import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupTwoComponent } from './followup-two.component';

describe('FollowupTwoComponent', () => {
  let component: FollowupTwoComponent;
  let fixture: ComponentFixture<FollowupTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FollowupTwoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowupTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
