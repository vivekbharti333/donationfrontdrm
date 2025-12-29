import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentModeManagementComponent } from './payment-mode-management.component';

describe('PaymentModeManagementComponent', () => {
  let component: PaymentModeManagementComponent;
  let fixture: ComponentFixture<PaymentModeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentModeManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentModeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
