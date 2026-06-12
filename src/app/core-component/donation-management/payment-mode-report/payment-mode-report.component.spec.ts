import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentModeReportComponent } from './payment-mode-report.component';

describe('PaymentModeReportComponent', () => {
  let component: PaymentModeReportComponent;
  let fixture: ComponentFixture<PaymentModeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentModeReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentModeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
