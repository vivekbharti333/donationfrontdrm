import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationManagementComponent } from './donation-management.component';

describe('DonationManagementComponent', () => {
  let component: DonationManagementComponent;
  let fixture: ComponentFixture<DonationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DonationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
