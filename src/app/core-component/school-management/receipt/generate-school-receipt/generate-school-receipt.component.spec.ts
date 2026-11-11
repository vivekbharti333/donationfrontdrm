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
