import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupThreeComponent } from './followup-three.component';

describe('FollowupThreeComponent', () => {
  let component: FollowupThreeComponent;
  let fixture: ComponentFixture<FollowupThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FollowupThreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowupThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
