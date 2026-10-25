import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { SchoolManagementService } from '../../school-management.service';
import { FeeDueReportComponent } from './fee-due-report.component';
import { DueFeeRow, DueFeeReportResponse, FeeDueReportService } from './fee-due-report.service';

function feeRow(overrides: Partial<DueFeeRow> = {}): DueFeeRow {
  return {
    studentId: 62, studentAcademicId: 101, admissionNo: '62', rollNumber: '24', studentName: 'Aditya Kumar',
    sessionName: '2026-27', grade: 'Nursery', gradeSection: 'A', feeTypeId: 1, feeTypeName: 'Tuition Fee',
    frequency: 'MONTHLY', dueThroughMonth: 'March', totalDue: 1500, requiresReview: false,
    dueInstallments: ['January', 'February', 'April'].map(installmentName => ({
      installmentName, payableAmount: 500, paidAmount: 0, balanceAmount: 500
    })), ...overrides
  };
}

describe('FeeDueReportComponent', () => {
  let component: FeeDueReportComponent;
  let fixture: ComponentFixture<FeeDueReportComponent>;
  let report: jasmine.SpyObj<FeeDueReportService>;
  let school: jasmine.SpyObj<SchoolManagementService>;

  beforeEach(async () => {
    report = jasmine.createSpyObj('FeeDueReportService', ['getReport', 'getSchoolHeader']);
    report.getSchoolHeader.and.returnValue(of({ name: 'Champaran International Academy',
      logo: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221%22%20height%3D%221%22%3E%3C%2Fsvg%3E' }));
    school = jasmine.createSpyObj('SchoolManagementService', ['getGradeDetails', 'getFeeTypeDetails', 'getStudentAcademicDetails']);
    school.getGradeDetails.and.returnValue(of({ responseCode: 200, listPayload: [{ gradeName: 'Nursery' }] }));
    school.getFeeTypeDetails.and.returnValue(of({ responseCode: 200, listPayload: [{ id: 1, feeTypeName: 'Tuition Fee' }] }));
    school.getStudentAcademicDetails.and.returnValue(of({ responseCode: 200, listPayload: [{ id: 62, firstName: 'Aditya', lastName: 'Kumar', admissionNo: '62' }] }));
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [] }));
    await TestBed.configureTestingModule({
      imports: [FeeDueReportComponent, NoopAnimationsModule],
      providers: [{ provide: FeeDueReportService, useValue: report }, { provide: SchoolManagementService, useValue: school }]
    }).compileComponents();
    fixture = TestBed.createComponent(FeeDueReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('waits for search before requesting financial data', () => {
    expect(report.getReport).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.due-table')).toBeNull();
    expect(component.students[0].id).toBe(62);
  });

  it('keeps the fee type trigger inside the field height', () => {
    const field: HTMLElement = fixture.nativeElement.querySelector('.fee-type-select');
    const trigger: HTMLElement = field.querySelector('.mat-mdc-select-trigger')!;
    const month: HTMLElement = fixture.nativeElement.querySelector('#due-month');
    expect(Math.round(field.getBoundingClientRect().height)).toBe(Math.round(month.getBoundingClientRect().height));
    expect(trigger.getBoundingClientRect().height).toBeLessThanOrEqual(field.clientHeight);
    expect(getComputedStyle(trigger).borderTopWidth).toBe('0px');
  });

  it('searches the student dropdown by name or admission number and selects the matching student', async () => {
    component.students = [{ id: 62, label: 'Aditya Kumar (62)' }, { id: 39, label: 'Ahan (39)' }];
    fixture.detectChanges(); await fixture.whenStable();
    fixture.nativeElement.querySelector('.due-student-dropdown .p-dropdown-trigger').click();
    fixture.detectChanges(); await fixture.whenStable();
    const search = document.querySelector<HTMLInputElement>('.due-student-panel input.p-dropdown-filter')!;
    expect(search).not.toBeNull();
    search.value = 'Aditya'; search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges(); await fixture.whenStable();
    expect(document.querySelector('.due-student-panel')?.textContent).toContain('Aditya Kumar');
    expect(document.querySelector('.due-student-panel')?.textContent).not.toContain('Ahan');
    search.value = '39'; search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges(); await fixture.whenStable();
    expect(document.querySelector('.due-student-panel')?.textContent).not.toContain('Aditya Kumar');
    const option = document.querySelector<HTMLElement>('.due-student-panel .p-dropdown-item')!;
    expect(option.textContent).toContain('Ahan'); option.click();
    fixture.detectChanges(); await fixture.whenStable(); expect(component.studentId).toBe(39);
  });

  it('merges the student cell while rendering separate fee lines and amounts', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [feeRow(), feeRow({ feeTypeId: 2, feeTypeName: 'Transport Fee', totalDue: 1000 })] }));
    component.loadReport(); fixture.detectChanges();
    const table: HTMLElement = fixture.nativeElement.querySelector('.due-table');
    expect(table.querySelectorAll('tbody .student-cell').length).toBe(1);
    expect(table.querySelector('.student-cell')?.getAttribute('rowspan')).toBe('2');
    expect(table.querySelectorAll('tbody tr').length).toBe(2);
    expect(table.textContent).toContain('January, February, April');
    expect(table.textContent).toContain('Transport Fee');
    expect(component.totalDue).toBe(2500);
  });

  it('keeps different academic records separate even when names are identical', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [feeRow(), feeRow({ studentId: 63, studentAcademicId: 102 })] }));
    component.loadReport(); fixture.detectChanges();
    expect(component.studentGroups.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('tbody .student-cell').length).toBe(2);
  });

  it('excludes ambiguous or missing balances from the confirmed total', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [feeRow(), feeRow({ feeTypeId: 2, totalDue: null, requiresReview: true, reviewMessage: 'Review earlier receipts' })] }));
    component.loadReport(); fixture.detectChanges();
    expect(component.totalDue).toBe(1500);
    expect(component.reviewCount).toBe(1);
    expect(fixture.nativeElement.querySelector('.review-label').textContent).toContain('Needs review');
    expect(fixture.nativeElement.querySelector('.review-message').textContent).toContain('Review earlier receipts');
  });

  it('sends the selected API filters including multiple fee types', () => {
    component.sessionName = '2026-27'; component.grade = 'Nursery'; component.gradeSection = 'A';
    component.studentId = 62; component.feeTypeIds = [1, 2]; component.dueThroughMonth = 'January'; component.loadReport();
    expect(report.getReport).toHaveBeenCalledWith({ sessionName: '2026-27', grade: 'Nursery', gradeSection: 'A', studentId: 62, feeTypeIds: [1, 2], dueThroughMonth: 'January' });
  });

  it('cancels old requests and clears stale balances when filters change', () => {
    const pending = new Subject<DueFeeReportResponse>(); report.getReport.and.returnValue(pending);
    component.loadReport(); component.filtersChanged(); pending.next({ responseCode: 200, listPayload: [feeRow()] });
    expect(component.studentGroups.length).toBe(0); expect(component.hasSearched).toBeFalse(); expect(component.isLoading).toBeFalse();
  });

  it('shows an API error rather than reporting no dues on failure', () => {
    report.getReport.and.returnValue(throwError(() => ({ status: 500 })));
    component.loadReport(); fixture.detectChanges();
    expect(component.errorMessage).toContain('Unable to load');
    expect(fixture.nativeElement.querySelector('.error-state')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('No outstanding fees found');
  });

  it('paginates whole student groups without splitting their fee rows', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [feeRow(), feeRow({ feeTypeId: 2 }), feeRow({ studentAcademicId: 102, studentId: 63 })] }));
    component.loadReport(); component.pageSize = 1;
    expect(component.visibleStudents[0].fees.length).toBe(2);
    component.setPage(2); expect(component.visibleStudents[0].key).toBe(63); expect(component.totalDue).toBe(4500);
  });

  it('requests all previous years by default and merges the same student across sessions', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [feeRow(), feeRow({ studentAcademicId: 90, sessionName: '2025-26' })] }));
    component.loadReport(); fixture.detectChanges();
    expect(report.getReport).toHaveBeenCalledWith({ sessionName: component.sessionName, includePreviousSessions: true });
    expect(component.studentGroups.length).toBe(1);
    expect(fixture.nativeElement.querySelector('.student-cell').getAttribute('rowspan')).toBe('2');
    expect(fixture.nativeElement.textContent).toContain('2025-26');
  });

  it('explains blocked CORS requests instead of showing a generic error', () => {
    report.getReport.and.returnValue(throwError(() => ({ status: 0 })));
    component.loadReport(); fixture.detectChanges();
    expect(component.errorMessage).toContain('CORS'); expect(component.errorMessage).toContain('preflight');
    expect(fixture.nativeElement.textContent).not.toContain('No outstanding fees found');
  });

  it('prints a separate branded slip and correct total for each student across pages', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [
      feeRow(), feeRow({ feeTypeId: 2, feeTypeName: 'Transport Fee', totalDue: 1000 }),
      feeRow({ studentId: 63, studentAcademicId: 102, studentName: 'Ritik Kumar', totalDue: 350 })
    ] }));
    component.loadReport(); component.pageSize = 1; fixture.detectChanges(); component.printReport();
    expect(fixture.nativeElement.querySelector('.school-brand img')).not.toBeNull();
    const frame = document.querySelector<HTMLIFrameElement>('iframe[title="Fee due report print frame"]')!;
    spyOn(frame.contentWindow!, 'print').and.stub();
    const printed = frame.contentDocument!;
    expect(printed.querySelector('.due-school-heading h2')?.textContent).toBe('Champaran International Academy');
    expect(printed.querySelector('.due-school-heading img')?.getAttribute('src')).toContain('data:image/');
    expect(printed.querySelectorAll('.due-slip-student-name').length).toBe(2);
    expect(printed.querySelector('.due-slip-fees tbody')?.querySelectorAll('tr').length).toBe(2);
    expect(printed.body.textContent).toContain('Ritik Kumar');
    const slips = printed.querySelectorAll('.due-student-slip');
    expect(slips.length).toBe(2);
    expect(printed.querySelectorAll('.due-school-heading img').length).toBe(2);
    expect(printed.querySelectorAll('.due-school-heading h1').length).toBe(2);
    expect(slips[0].querySelector('h1')?.textContent).toBe('Due Slip');
    expect(slips[0].textContent).toContain('Aditya Kumar');
    expect(slips[0].textContent).not.toContain('Ritik Kumar');
    expect(slips[0].querySelector('.due-slip-total')?.textContent).toContain('2,500.00');
    expect(slips[1].textContent).toContain('Ritik Kumar');
    expect(slips[1].textContent).not.toContain('Aditya Kumar');
    expect(slips[1].querySelector('.due-slip-total')?.textContent).toContain('350.00');
    expect(printed.body.textContent).not.toContain('2,850.00');
    expect(printed.querySelector('.report-pagination')).toBeNull();
    component.ngOnDestroy(); expect(frame.isConnected).toBeFalse();
  });

  it('keeps review notices and confirmed totals specific to the student slip', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [feeRow(),
      feeRow({ feeTypeId: 2, totalDue: null, requiresReview: true, reviewMessage: 'Review earlier receipts' }),
      feeRow({ studentId: 63, studentAcademicId: 102, studentName: 'Ritik Kumar', totalDue: 350 })] }));
    component.loadReport(); fixture.detectChanges(); component.printReport();
    const frame = document.querySelector<HTMLIFrameElement>('iframe[title="Fee due report print frame"]')!;
    spyOn(frame.contentWindow!, 'print').and.stub();
    const slips = frame.contentDocument!.querySelectorAll('.due-student-slip');
    expect(slips[0].textContent).toContain('school review');
    expect(slips[0].querySelector('.due-slip-total')?.textContent).toContain('1,500.00');
    expect(slips[1].textContent).not.toContain('review');
    expect(slips[1].querySelector('.due-slip-total')?.textContent).toContain('350.00');
    component.ngOnDestroy();
  });

  it('does not print a misleading school heading when school details could not load', () => {
    report.getReport.and.returnValue(of({ responseCode: 200, listPayload: [feeRow()] }));
    component.loadReport(); component.schoolHeader = { name: '', logo: '' }; component.printReport();
    expect(component.printError).toContain('school name');
    expect(document.querySelector('iframe[title="Fee due report print frame"]')).toBeNull();
  });

  it('tries the same school legacy logo endpoint before reporting a missing image', () => {
    component.schoolHeader = { name: 'School', logo: '/media/school/logo.png', logoFallbacks: ['/invoiceHeaderImage/school/logo.png'] };
    component.onSchoolLogoError(); expect(component.schoolHeader.logo).toBe('/invoiceHeaderImage/school/logo.png');
    expect(component.schoolLogoError).toBe('');
    component.onSchoolLogoError(); expect(component.schoolHeader.logo).toBe('');
    expect(component.schoolLogoError).toContain('receipt header');
  });
});
