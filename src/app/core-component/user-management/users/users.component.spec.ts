import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { UsersComponent } from './users.component';

describe('UsersComponent list and address editing', () => {
  let component: UsersComponent;
  let api: any;
  let messages: any;
  let pagination: any;
  beforeEach(() => {
    api = { getAddressDetailsByUserId: jasmine.createSpy(), updateUserDetails: jasmine.createSpy(),
      getUserDetailsList: () => of({ responseCode: 200, listPayload: [] }), getTeamleaderList: () => of({ responseCode: 200, listPayload: [] }) };
    messages = { add: jasmine.createSpy() };
    pagination = { tablePageSize: new BehaviorSubject({ skip: 0, limit: 2, pageSize: 2 }), calculatePageSize: new BehaviorSubject({}) };
    component = new UsersComponent({} as any, pagination, {} as any, {} as any, new FormBuilder(),
      { getLoginUser: () => ({ roleType: 'SUPERADMIN' }) } as any, messages, api, {} as any, { get: () => 'SUPERADMIN' } as any);
    component.createForms();
  });
  it('accepts numeric address response codes', () => {
    api.getAddressDetailsByUserId.and.returnValue(of({ responseCode: 200, listPayload: [{ addressType: 'CURRENT', addressLine: 'Saved' }] }));
    const callback = jasmine.createSpy(); component.getAddressDetailsByUserId({ id: 1 }, callback);
    expect(callback).toHaveBeenCalled(); expect(component.userAddressList[0].addressLine).toBe('Saved');
  });
  it('does not open an empty editor after address loading fails', () => {
    api.getAddressDetailsByUserId.and.returnValue(throwError(() => new Error('Unavailable')));
    const callback = jasmine.createSpy(); component.getAddressDetailsByUserId({ id: 1 }, callback);
    expect(callback).not.toHaveBeenCalled(); expect(messages.add).toHaveBeenCalled();
  });
  it('keeps search results when changing pages', () => {
    component.ngOnInit();
    component.fullData = [{ firstName: 'Alice 1' }, { firstName: 'Bob' }, { firstName: 'Alice 2' }, { firstName: 'Alice 3' }];
    component.searchData('Alice'); pagination.tablePageSize.next({ skip: 2, limit: 4, pageSize: 2 });
    expect(component.totalData).toBe(3); expect(component.tableData[0].firstName).toBe('Alice 3');
    expect(component.serialNumberArray).toEqual([3]); component.ngOnDestroy();
  });
  it('accepts names and keeps the editor open when an update is rejected', () => {
    component.editUserForm.patchValue({ firstName: 'Vivek', lastName: 'Bharti', roleType: 'ADMIN', mobileNo: '9876543210', alternateMobile: '9876543211', emailId: 'user@example.com' });
    expect(component.editUserForm.valid).toBeTrue();
    component.userUpdateDialog = { close: jasmine.createSpy() };
    api.updateUserDetails.and.returnValue(of({ responseCode: 200, payload: { respCode: 400, respMesg: 'Rejected' } }));
    component.updateUserDetails(); expect(component.userUpdateDialog.close).not.toHaveBeenCalled(); expect(component.isUpdatingUser).toBeFalse();
  });
});
