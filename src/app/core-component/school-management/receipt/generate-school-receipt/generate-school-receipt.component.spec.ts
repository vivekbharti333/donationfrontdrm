import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { GenerateSchoolReceiptComponent } from './generate-school-receipt.component';

describe('GenerateSchoolReceiptComponent previous dues', () => {
  let component: GenerateSchoolReceiptComponent;
  const fb = new FormBuilder();
  beforeEach(() => {
    component = new GenerateSchoolReceiptComponent(fb, {} as any, {} as any, {} as any,
      { getLoginUser: () => ({}) } as any, {} as any, {} as any);
    component.createReceiptForm();
    component.receiptDetails.push(fb.group({ previousDue: true, selected: true, amount: 300, balance: 300 }));
    component.receiptDetails.push(fb.group({ previousDue: false, selected: true, amount: 500, balance: 500 }));
  });
  it('keeps October dues separate from November even when both use the same assigned fee', () => {
    const common = {id: 5, studentId: 12, studentAcademicId: 28, sessionName: '2026-27', grade: '4', gradeSection: 'A', feeTypeName: 'Tuition Fee', frequency: 'MONTHLY', payableAmount: 500, paidAmount: 0};
    const service = {getStudentFeesForReceipt: jasmine.createSpy().and.returnValue(of({responseCode: 200, listPayload: [
      {...common, previousDue: true, installmentName: 'October', installmentPeriod: 'October', installmentBalanceAmount: 300},
      {...common, previousDue: false, installmentName: 'November', installmentPeriod: 'November', installmentBalanceAmount: 500}
    ]}))};
    component = new GenerateSchoolReceiptComponent(fb, {} as any, {} as any, service as any,
      {getLoginUser: () => ({})} as any, {} as any, {} as any);
    component.createReceiptForm();component.createSearchForm();
    component.receiptForm.patchValue({installmentName: 'November'});
    const student = {studentId: 12, sessionName: '2026-27', grade: '4', gradeSection: 'A'};
    component.selectedStudent = student;
    component.loadAssignedFees(student);
    expect(service.getStudentFeesForReceipt).toHaveBeenCalledWith(12, '2026-27', 'November');
    expect(component.receiptDetails.length).toBe(2);
    expect(component.receiptDetails.at(0).get('installmentName')?.value).toBe('October');
    expect(component.receiptDetails.at(0).get('balance')?.value).toBe(300);
    expect(component.receiptDetails.at(1).get('installmentName')?.value).toBe('November');
    expect(component.receiptDetails.at(1).get('balance')?.value).toBe(500);
    expect(component.previousDueTotal).toBe(300);
    expect(component.sessionFeeSummary.length).toBe(1);
  });
  it('includes automatically selected dues in the receipt total', () => {
    component.calculateTotals();
    expect(component.previousDueTotal).toBe(300);
    expect(component.receiptForm.get('netAmount')?.value).toBe(800);
  });
  it('allows partial collection and restores full dues when continuing', () => {
    component.modifyPreviousDues = true;
    component.receiptDetails.at(0).patchValue({ amount: 100 });
    component.calculateTotals();
    expect(component.receiptForm.get('netAmount')?.value).toBe(600);
    component.continueWithPreviousDues();
    expect(component.modifyPreviousDues).toBeFalse();
    expect(component.receiptForm.get('netAmount')?.value).toBe(800);
  });
});
