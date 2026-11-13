import { Component, importProvidersFrom, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { UserManagementService } from '../user-management.service';
import { UserDetails } from '../../interface/user-management';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { AuthenticationService } from 'src/app/auth/authentication.service'; 
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { parsePermissions } from 'src/app/core/helpers/dashboard-permissions';

interface data {
  value: string;
  name: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  providers: [MessageService, ToastModule],
})
export class UsersComponent {
  private readonly destroyed$ = new Subject<void>();
  private filteredData: any[] = [];
  private listRequestId = 0;
  private selectedRoleType = '';
  private addressRequestId = 0;
  public isUpdatingUser = false;
  public loginUser: any;
  public isMainAdmin: boolean = false;
  public isSuperadmin: boolean = false;
  public isAdmin: boolean = false;
  public isTeamLeader: boolean = false;
  public isDonationExecutive: boolean = false;
  public editUserForm!: FormGroup;
  public teamLeaderForm!: FormGroup;

  public userUpdateDialog: any;
  public validityDialog: any;
  public validityUser: any = null;
  public validityExpireOnDate = '';
  public isUpdatingValidity = false;

  public fullData: any[] = [];
  public teamLeaderList: any;
  // public addressList: any;

  public userRoleList!: any;
  public userPhoto: any;
  public editUserSuperadminId = '';
  public userAddressList: any;
  public loginId :any;

   public roleTypes = [
    { id: 1, name: 'SUPERADIN' },
    { id: 2, name: 'ADMIN' },
    { id: 3, name: 'TEAMLEAER' },
  ];

  initChecked = false;
  selectedValue1 = '';
  selectedValue2 = '';
  selectedValue3 = '';
  selectedValue4 = '';
  selectedValue5 = '';
  selectedValue6 = '';
  selectedValue7 = '';

  public userList: any;

  public routes = routes;
  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 2;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  public activeUserCount = 0;
  public inactiveUserCount = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<UserDetails>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private userManagementService: UserManagementService,
    private dialog: MatDialog,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }


  ngOnInit() {
    this.createForms();
    this.pagination.tablePageSize.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      this.pageSize = res.pageSize;
      const skip = res.skip < this.filteredData.length ? res.skip : 0;
      this.prepareTableData(this.filteredData, { skip, limit: skip + res.pageSize });
    });
    this.getUserDetails();
    this.checkRoleType();
    this.getUserRoleType();
    this.getTeamleaderList();
  }

  ngOnDestroy(): void {
    this.listRequestId++;
    this.addressRequestId++;
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  genderType: data[] = [
    { value: '1', name: 'MALE' },
    { value: '2', name: 'FEMALE' },
    { value: '3', name: 'OTHER' },
  ];

  getUserRoleType(){
    if( this.cookieService.get('roleType') === Constant.mainAdmin){
      this.userRoleList = [{value: Constant.superAdmin, name: 'Superadmin'}, {value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];

    }else if( this.cookieService.get('roleType') === Constant.superAdmin){
      this.userRoleList = [{value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}, { value: Constant.donorExecutive, name: 'Donation Executive'}];

    }else if( this.cookieService.get('roleType') === Constant.admin){
      this.userRoleList = [{value: Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
    }else if( this.cookieService.get('roleType') === Constant.teamLeader){
      this.userRoleList = [{ value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
    }
  }

  public permissionsList: data[] = [];
  private readonly donationPermissionOptions: data[] = [
    { value: 'donation-dashboard', name: 'Donation Dashboard' },
    { value: 'create-user', name: 'Create User' },
    { value: 'user-list', name: 'User List' },
    { value: 'add-donation', name: 'Add Donation' },
    { value: 'all-donation-list', name: 'Donation List' },
    { value: 'payment-mode', name: 'Payment Mode' },
    { value: 'payment-report', name: 'Payment Report' },
    { value: 'program', name: 'Donation Program' },
    { value: 'admin-dashboard', name: 'Donation Lead Dashboard' },
    { value: 'create-lead', name: 'Create Donation Lead' },
    { value: 'lead-list', name: 'Donation Lead List' },
    { value: 'general-setting', name: 'General Setting' },
    { value: 'company-setting', name: 'NGO Invoice Setting' }
  ];
  private readonly schoolPermissionOptions: data[] = [
    { value: 'school-dashboard', name: 'School Dashboard' },
    { value: 'add-student', name: 'Add Student' },
    { value: 'student-list', name: 'Student List' },
    { value: 'generate-school-receipt', name: 'Generate School Receipt' },
    { value: 'school-receipt-list', name: 'School Receipt List' },
    { value: 'student-academic', name: 'Student Academic' },
    { value: 'fee-type', name: 'Fee Type' },
    { value: 'fee-structure', name: 'Fee Structure' },
    { value: 'fee-assignment', name: 'Fee Assignment' },
    { value: 'grade', name: 'Grade' }
  ];


  onRoleTypeChange(event: any) {
    console.log('Selected gender:', event.value);
    this.getUserDetailsByRoleType(event.value);
    // Additional logic can be added here
  }


  // checkRoleType(){
    
  //   if( this.cookieService.get('roleType') === Constant.mainAdmin){
  //     this.isMainAdmin = true;
  //   }else if( this.cookieService.get('roleType') === Constant.superAdmin){
  //     this.isSuperadmin = true;
  //   }else if( this.cookieService.get('roleType') === Constant.admin){
  //     this.isAdmin = true;
  //     this.isSuperadmin = true;
  //   }else if( this.cookieService.get('roleType') === Constant.teamLeader){
  //     this.isTeamLeader = true;
  //   }
  // }

  checkRoleType() {
    if (this.loginUser['roleType'] == Constant.mainAdmin) {
      this.isMainAdmin = true;
    } else if (this.loginUser['roleType'] == Constant.superAdmin) {
      this.isSuperadmin = true;
      this.isAdmin = true;
    } else if (this.loginUser['roleType'] == Constant.admin) {
      this.isAdmin = true;
      this.isSuperadmin = true;
    } else if (this.loginUser['roleType'] == Constant.teamLeader) {
      this.isTeamLeader = true;
    } else if (this.loginUser['roleType'] == Constant.donorExecutive) {
      this.isDonationExecutive = true;
    }
  }

  createForms() {
    this.editUserForm = this.fb.group({
      loginId: [''],
      firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z]+(?:[ .][A-Za-z]+)*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z]+(?:[ .][A-Za-z]+)*$')]],
      roleType: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      alternateMobile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      emailId: ['', [Validators.required, Validators.email]],
      dob: [''],
      permissions: [''],
      userPicture:[''],
      createdBy: [''],
      addressList: this.fb.array([
        this.addressForm(),
        this.addressForm()]),
    });
    this.teamLeaderForm = this.fb.group({
      teamLeaderId: [''],
      searchKey: [''],
    });
    
  }

  get addressList(): FormArray {
    return this.editUserForm.get("addressList") as FormArray
  }

  addressForm() {
    return this.fb.group({
      addressType: [''],
      addressLine: [''],
      landmark: [''],
      district: [''],
      city: [''],
      state: [''],
      country: ['INDIA'],
      pincode: ['']
    });
  }

  openEditModal(templateRef: TemplateRef<any>, user: any): void {
    this.permissionsList = String(user?.service || '').toUpperCase().includes('SCHOOL')
      ? this.schoolPermissionOptions
      : this.donationPermissionOptions;
    this.editUserSuperadminId = String(
      user?.superadminId || this.loginUser?.superadminId || this.loginUser?.loginId || ''
    );
    this.getAddressDetailsByUserId(user, () => {
      const addressMap = new Map<string, any>();
      if (Array.isArray(this.userAddressList)) {
        this.userAddressList.forEach(addr => {
          if (addr?.addressType) {
            const type = String(addr.addressType).trim().toUpperCase();
            if (!addressMap.has(type)) addressMap.set(type, addr);
          }
        });
      }

      // Clear existing addressList FormArray
      this.addressList.clear();

      // Always provide Current and Permanent address forms
      const addressTypes = ['CURRENT', 'PERMANENT'];
      addressTypes.forEach(type => {
        const existing = addressMap.get(type);
        const addressGroup = this.addressForm();
        addressGroup.patchValue({
          addressType: type,
          addressLine: existing?.addressLine || '',
          landmark: existing?.landmark || '',
          district: existing?.district || '',
          city: existing?.city || '',
          state: existing?.state || '',
          country: existing?.country || 'INDIA',
          pincode: existing?.pincode || '',
        });
        this.addressList.push(addressGroup);
      });

      const formattedDob = this.formatValidityDateForInput(user['dob']);
  
      this.editUserForm.patchValue({
        loginId: user['loginId'],
        firstName: user['firstName'],
        lastName: user['lastName'],
        roleType: user['roleType'],
        mobileNo: user['mobileNo'],
        alternateMobile: user['alternateMobile'],
        emailId: user['emailId'],
        dob: formattedDob,
        userPicture: user['userPicture'],
        createdBy: user['createdBy'],
        permissions: parsePermissions(user['permissions'])
      });
  
      this.userPhoto = this.userImageUrl(user);
  
      this.userUpdateDialog = this.dialog.open(templateRef, {
        width: '1100px',
        maxWidth: '95vw',
        maxHeight: '92vh',
        disableClose: true,
        panelClass: ['custom-modal', 'user-edit-dialog'],
      });
    });
  }

  openValidityModal(templateRef: TemplateRef<any>, user: any): void {
    if (!this.canUpdateValidity(user) || !user?.loginId) return;
    this.validityUser = user;
    this.validityExpireOnDate = this.formatValidityDateForInput(user.validityExpireOn);
    this.validityDialog = this.dialog.open(templateRef, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
    this.validityDialog.afterClosed().subscribe(() => {
      this.validityUser = null;
      this.validityExpireOnDate = '';
    });
  }

  saveUserValidity(): void {
    if (!this.canUpdateValidity(this.validityUser) || this.isUpdatingValidity || !this.validityUser?.loginId || !this.validityExpireOnDate) return;
    this.isUpdatingValidity = true;
    this.userManagementService.updateUserValidity(this.validityUser.loginId, this.validityExpireOnDate).subscribe({
      next: (response: any) => {
        this.isUpdatingValidity = false;
        if (Number(response?.responseCode) !== 200 || Number(response?.payload?.respCode) !== 200) {
          this.messageService.add({
            severity: 'error',
            summary: 'Unable to update validity',
            detail: response?.responseMessage || response?.payload?.respMesg
          });
          return;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Validity updated',
          detail: response?.payload?.respMesg
        });
        this.validityDialog?.close();
        this.getUserDetails();
      },
      error: () => {
        this.isUpdatingValidity = false;
        this.messageService.add({ severity: 'error', summary: 'Unable to update validity' });
      }
    });
  }

  private formatValidityDateForInput(value: any): string {
    if (!value) return '';
    const datePrefix = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
    if (datePrefix) return datePrefix[1];
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  canUpdateValidity(user: any): boolean {
    return this.isMainAdmin && String(user?.roleType || '').toUpperCase() === Constant.superAdmin;
  }
  
  

 
  public getUserDetailsByRoleType(roleType: any): void {
    this.selectedRoleType = String(roleType || '');
    this.getUserDetails();
  }

  public getUserDetails(): void {
    this.loadUsers(this.selectedRoleType
      ? this.userManagementService.getUserDetailsByRoleType(this.selectedRoleType)
      : this.userManagementService.getUserDetailsList());
  }

  private loadUsers(request: import('rxjs').Observable<any>): void {
    const requestId = ++this.listRequestId;
    request.pipe(takeUntil(this.destroyed$)).subscribe({
      next: response => {
        if (requestId !== this.listRequestId) return;
        if (Number(response?.responseCode) !== 200 || !Array.isArray(response?.listPayload)) {
          this.fullData = [];
          this.searchData(this.searchDataValue);
          this.messageService.add({ severity: 'error', summary: 'Unable to load users', detail: response?.responseMessage || 'Please try again.' });
          return;
        }
        this.fullData = response.listPayload;
        this.searchData(this.searchDataValue);
      },
      error: () => {
        if (requestId !== this.listRequestId) return;
        this.fullData = [];
        this.searchData(this.searchDataValue);
        this.messageService.add({ severity: 'error', summary: 'Unable to load users', detail: 'Please try again.' });
      }
    });
  }

    prepareTableData(apiRes: any[], pageOption: pageSelection): void {
      this.tableData = []; // Reset table data
      this.serialNumberArray = []; // Reset serial numbers
    
      // Slice data based on pagination limits (skip, limit)
      const dataToDisplay = apiRes.slice(pageOption.skip, pageOption.limit);
    
      // Add serial numbers and prepare table data
      dataToDisplay.forEach((res: any, index: number) => {
        const serialNumber = pageOption.skip + index + 1;
        this.tableData.push(res);
        this.serialNumberArray.push(serialNumber);
      });
    
      // Update MatTableDataSource
      this.dataSource = new MatTableDataSource<any>(this.tableData);
    
      // Emit updated pagination data
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
    }
  

  public sortData(sort: Sort) {
    const data = this.tableData.slice();
    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public searchData(value: string): void {
    this.searchDataValue = value;
    const term = value.trim().toLowerCase();
    this.filteredData = term ? this.fullData.filter(user => Object.values(user)
      .some(field => String(field ?? '').toLowerCase().includes(term))) : [...this.fullData];
    this.totalData = this.filteredData.length;
    this.updateUserStatusCounts(this.filteredData);
    this.prepareTableData(this.filteredData, { skip: 0, limit: this.pageSize });
  }

  private updateUserStatusCounts(users: any[] = []): void {
    const rows = Array.isArray(users) ? users : [];
    this.activeUserCount = rows.filter(user => String(user?.status || '').toUpperCase() === 'ACTIVE').length;
    this.inactiveUserCount = rows.filter(user => String(user?.status || '').toUpperCase() === 'INACTIVE').length;
  }

  // public searchData(value: string): void {
  //   this.dataSource.filter = value.trim().toLowerCase();
  //   this.tableData = this.dataSource.filteredData;
  // }

  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
  confirmColor(loginId : any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: ' btn btn-success',
        cancelButton: 'me-2 btn btn-danger',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
    .fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      confirmButtonText: 'Yes, delete it!',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        // Call your function here
        this.removeUserParmanent(loginId); // Replace this with your actual function
  
        // swalWithBootstrapButtons.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        );
      }
    });
  }

  removeUserParmanent(loginId: any){
    this.userManagementService.removeUserParmanent(loginId)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {

            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'success-background-popover',
            });

            this.getUserDetails();
          } else {
              this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        } else {
          this.messageService.add({
            summary: response['responseCode'],
            detail: response['responseMsg'],
            styleClass: 'danger-background-popover',
          });
        }
      },
    });
}
  public password: boolean[] = [false];

  public togglePassword(index: number) {
    this.password[index] = !this.password[index];
  }
  selectAll(initChecked: boolean) {
    if (!initChecked) {
      this.tableData.forEach((f) => {
        f.isSelected = true;
      });
    } else {
      this.tableData.forEach((f) => {
        f.isSelected = false;
      });
    }
  }

  public getTeamleaderList() {
    this.userManagementService.getTeamleaderList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.userList = JSON.parse(JSON.stringify(response['listPayload']));
           
          } else {
            
          }
        },
      });
  }

  // public getAddressDetailsByUserId(user:any) {
  //   this.userAddressList ;
  //   this.userManagementService.getAddressDetailsByUserId(user)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response['responseCode'] == '200') {
  //           this.userAddressList = JSON.parse(JSON.stringify(response['listPayload']));
           
  //         } else {
            
  //         }
  //       },
        
  //     });
  // }

  public getAddressDetailsByUserId(user: any, callback: () => void): void {
    const requestId = ++this.addressRequestId;
    this.userAddressList = [];
    this.userManagementService.getAddressDetailsByUserId(user).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (response: any) => {
        if (requestId !== this.addressRequestId) return;
        if (Number(response?.responseCode) !== 200 || !Array.isArray(response?.listPayload)) {
          this.messageService.add({ severity: 'error', summary: 'Unable to load addresses', detail: 'Please retry opening this user. No changes have been saved.' });
          return;
        }
        this.userAddressList = response.listPayload;
        callback();
      },
      error: () => {
        if (requestId !== this.addressRequestId) return;
        this.messageService.add({ severity: 'error', summary: 'Unable to load addresses', detail: 'Please retry opening this user. No changes have been saved.' });
      }
    });
  }

  changeUserStatus(rowData: any) {
    this.userManagementService.changeUserStatus(rowData).subscribe({
      next: (response: any) => {
        console.log(response['responseCode'] + ' kjhk');
        console.log(response['payload']['respCode'] + ' resesr');
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            this.getUserDetails();

            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'success-background-popover',
            });
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        } else {
          this.messageService.add({
            summary: response['payload']['respCode'],
            detail: response['payload']['respMesg'],
            styleClass: 'danger-background-popover',
          });
        }
      },
      error: () =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
        }),
    });
    // this.isLoading = false;
  }

  public getAddressListByUserId(userId: any) {
    this.userManagementService.getAddressListByUserId(userId).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          // this.addressList = JSON.parse(
          //   JSON.stringify(response['listPayload'])
          // );
          // alert('hghgg : ' + this.addressList);
          // console.log(this.addressList);
        } else {
        }
      },
      // error: (error: any) => this.toastr.error('Server Error', '500'),
    });
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      if (!selectedFile.type?.startsWith('image/')) {
        event.target.value = '';
        this.messageService.add({
          summary: 'Invalid image',
          detail: 'Please select a valid image file.',
          styleClass: 'danger-background-popover',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const imageDataUrl = String(event.target.result || '');
        this.editUserForm.patchValue({
          userPicture: imageDataUrl
        });
        this.userPhoto = imageDataUrl;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  get canManageUsers(): boolean {
    return this.isMainAdmin || this.isSuperadmin;
  }

  userImageUrl(user: any): string {
    return this.resolveUserImage(
      user?.userPicture,
      user?.superadminId || this.loginUser?.superadminId || this.loginUser?.loginId
    );
  }

  get editUserPicturePreview(): string {
    return this.resolveUserImage(
      this.editUserForm?.get('userPicture')?.value,
      this.editUserSuperadminId
    );
  }

  useDefaultUserImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = 'assets/img/profiles/avatar-02.jpg';
  }

  private resolveUserImage(value: any, superadminId: any): string {
    const imageValue = String(value || '').trim();
    if (!imageValue) {
      return 'assets/img/profiles/avatar-02.jpg';
    }
    if (/^(data:image\/|blob:|https?:)/i.test(imageValue)) {
      return imageValue;
    }
    if (imageValue.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(imageValue)) {
      return 'data:image/png;base64,' + imageValue;
    }
    const tenantId = String(superadminId || '').trim();
    const service = String(this.loginUser?.service || '').trim();
    if (!tenantId || !service) {
      return 'assets/img/profiles/avatar-02.jpg';
    }
    return Constant.Site_Url + 'userImage/'
      + encodeURIComponent(service) + '/'
      + encodeURIComponent(tenantId) + '/'
      + encodeURIComponent(imageValue);
  }

  updateUserDetails(): void {
    if (this.isUpdatingUser) return;
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Check user details', detail: 'Enter valid names, mobile numbers, email and role before saving.' });
      return;
    }
    this.isUpdatingUser = true;
    this.userManagementService.updateUserDetails(this.editUserForm.getRawValue()).subscribe({
      next: response => {
        this.isUpdatingUser = false;
        const success = Number(response?.responseCode) === 200 && Number(response?.payload?.respCode) === 200;
        this.messageService.add({ severity: success ? 'success' : 'error', summary: success ? 'User updated' : 'Unable to update user',
          detail: response?.payload?.respMesg || response?.responseMessage || 'Please try again.' });
        if (success) {
          this.userUpdateDialog?.close();
          this.getUserDetails();
        }
      },
      error: () => {
        this.isUpdatingUser = false;
        this.messageService.add({ severity: 'error', summary: 'Unable to update user', detail: 'Your changes are still available. Please try again.' });
      }
    });
  }
}
