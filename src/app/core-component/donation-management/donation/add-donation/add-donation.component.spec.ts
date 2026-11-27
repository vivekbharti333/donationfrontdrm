import { FormBuilder } from '@angular/forms';
import { NEVER, of } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { AddDonationComponent } from './add-donation.component';

describe('AddDonationComponent', () => {
  let component: AddDonationComponent;
  let donationService: any;
  let messages: any;

  beforeEach(() => {
    donationService = {saveDonationDetails: jasmine.createSpy().and.returnValue(NEVER)};
    messages = {add: jasmine.createSpy()};
    component = new AddDonationComponent(new FormBuilder(), {} as any, {} as any, {} as any, {} as any,
      {} as any, donationService, messages, {getLoginUser: () => ({roleType: Constant.admin})} as any);
    component.checkRoleType();
    component.addDonationForm.patchValue({invoiceHeaderDetailsId: 1, donorName: 'Test Donor', mobileNumber: '9876543210',
      programName: 'Education', amount: 100, paymentMode: 'CASH'});
  });

  it('requires an officer for every role that displays the selector', () => {
    for (const roleType of [Constant.mainAdmin, Constant.superAdmin, Constant.admin]) {
      component.loginUser = {roleType}; component.checkRoleType();
      expect(component.showFundrisingOfficerList).toBeTrue();
      expect(component.addDonationForm.controls['createdBy'].hasError('required')).toBeTrue();
    }
  });
  it('blocks saving and shows a selection error when the visible officer is empty', () => {
    component.saveDonationDetails();
    expect(donationService.saveDonationDetails).not.toHaveBeenCalled();
    expect(component.addDonationForm.controls['createdBy'].touched).toBeTrue();
    expect(messages.add).toHaveBeenCalledWith(jasmine.objectContaining({detail: 'Please select a Fundrising Officer before submitting.'}));
  });
  it('saves a valid selected officer', () => {
    component.addDonationForm.controls['createdBy'].setValue('officer-1'); component.saveDonationDetails();
    expect(donationService.saveDonationDetails).toHaveBeenCalledWith(jasmine.objectContaining({createdBy: 'officer-1'}));
  });
  it('does not require officer selection when the field is hidden', () => {
    component.loginUser = {roleType: Constant.fundraisingOfficer}; component.checkRoleType();
    expect(component.showFundrisingOfficerList).toBeFalse();
    component.saveDonationDetails();
    expect(donationService.saveDonationDetails).toHaveBeenCalled();
  });
  it('requires a new selection after a successful donation resets the form', () => {
    component.currencyList = [{currencyCode: 'INR'}]; component.invoiceTypeList = [{id: 1}];
    donationService.saveDonationDetails.and.returnValue(of({responseCode: 200, payload: {respCode: 200, respMesg: 'Saved', paymentMode: 'CASH'}}));
    component.addDonationForm.controls['createdBy'].setValue('officer-1'); component.saveDonationDetails();
    expect(component.addDonationForm.controls['createdBy'].hasError('required')).toBeTrue();
    donationService.saveDonationDetails.calls.reset(); component.saveDonationDetails();
    expect(donationService.saveDonationDetails).not.toHaveBeenCalled();
  });
});
