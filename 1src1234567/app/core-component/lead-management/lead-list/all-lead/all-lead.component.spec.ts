import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllLeadComponent } from './all-lead.component';

describe('AllLeadComponent', () => {
  let component: AllLeadComponent;
  let fixture: ComponentFixture<AllLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllLeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
