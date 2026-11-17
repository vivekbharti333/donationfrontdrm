import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';
import { FeeReportComponent } from './fee-report.component';

describe('FeeReportComponent', () => {
  let component: FeeReportComponent;
  let fixture: ComponentFixture<FeeReportComponent>;
  let service: jasmine.SpyObj<SchoolManagementService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('SchoolManagementService', ['getMonthlyFeeReport']);
    service.getMonthlyFeeReport.and.returnValue(of({ responseCode: Constant.SUCCESS_CODE, listPayload: [
      { month: 'April 2026', totalFee: 1500, dueFee: 500, receivedFee: 1000 }
    ] }));
    await TestBed.configureTestingModule({
      declarations: [FeeReportComponent], imports: [CommonModule, FormsModule],
      providers: [{ provide: SchoolManagementService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(FeeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and displays monthly totals', () => {
    expect(service.getMonthlyFeeReport).toHaveBeenCalledWith(component.sessionName, false);
    expect(component.total('dueFee')).toBe(500);
    expect(fixture.nativeElement.textContent).toContain('April 2026');
    expect(fixture.nativeElement.textContent).toContain('1,500.00');
  });

  it('ignores an older request after the year changes', () => {
    const previous = new Subject<any>(); const current = new Subject<any>();
    service.getMonthlyFeeReport.and.returnValues(previous, current);
    component.loadReport(); component.sessionName = '2025-26'; component.loadReport();
    current.next({ responseCode: Constant.SUCCESS_CODE, listPayload: [] });
    previous.next({ responseCode: Constant.SUCCESS_CODE, listPayload: [{ month: 'Old year' }] });
    expect(component.rows).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });

  it('switches to fee type details using the radio button', () => {
    service.getMonthlyFeeReport.and.returnValue(of({ responseCode: Constant.SUCCESS_CODE, listPayload: [
      { month: 'April 2026', feeType: 'Tuition', totalFee: 1500, dueFee: 500, receivedFee: 1000 }
    ] }));
    const radio: HTMLInputElement = fixture.nativeElement.querySelector('input[value="feeType"]');
    radio.click(); fixture.detectChanges();
    expect(service.getMonthlyFeeReport).toHaveBeenCalledWith(component.sessionName, true);
    expect(fixture.nativeElement.textContent).toContain('Tuition');
    expect(fixture.nativeElement.querySelector('tfoot th').colSpan).toBe(2);
  });
});

