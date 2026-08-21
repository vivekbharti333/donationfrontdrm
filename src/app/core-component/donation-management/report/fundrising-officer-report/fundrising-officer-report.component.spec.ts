import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundrisingOfficerReportComponent } from './fundrising-officer-report.component';

describe('FundrisingOfficerReportComponent', () => {
  let component: FundrisingOfficerReportComponent;
  let fixture: ComponentFixture<FundrisingOfficerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundrisingOfficerReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FundrisingOfficerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
