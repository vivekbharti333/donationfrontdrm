import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGatewayDetailsComponent } from './payment-gateway-details.component';

describe('PaymentGatewayDetailsComponent', () => {
  let component: PaymentGatewayDetailsComponent;
  let fixture: ComponentFixture<PaymentGatewayDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentGatewayDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentGatewayDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
