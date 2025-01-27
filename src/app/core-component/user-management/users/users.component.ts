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

  public isMainAdmin: boolean = false;
  public isSuperadmin: boolean = false;
  public isAdmin: boolean = false;
  public isTeamLeader: boolean = false;
  public editUserForm!: FormGroup;
  public teamLeaderForm!: FormGroup;

  public userUpdateDialog: any;

  public fullData: any[] = [];
  public teamLeaderList: any;
  // public addressList: any;

  public userRoleList!: any;
  public userPhoto: any;
  public userAddressList: any;

  

  // public user = {
  //   userPicture: '',
  //   firstName: '',
  //   lastName: '',
  //   emailId: '',
  //   gender: '',
  //   permissions: '',
  //   roleType: '',
  //   mobileNo: '',
  //   alternateMobile: '',
  //   userCode: '',
  //   idDocumentType: '',
  //   idDocumentPicture: '',
  //   panNumber: '',
  //   dob: '',
  //   emergencyContactRelation1: '',
  //   emergencyContactName1: '',
  //   emergencyContactNo1: '',
  //   emergencyContactRelation2: '',
  //   emergencyContactName2: '',
  //   emergencyContactNo2: '',

  // };

  onRoleTypeChange(event: any) {
    console.log('Selected gender:', event.value);
    this.getUserDetailsByRoleType(event.value);
    // Additional logic can be added here
  }


  checkRoleType(){
    
    if( this.cookieService.get('roleType') === Constant.mainAdmin){
      this.isMainAdmin = true;
      // this.isSuperadmin = true;
    }else if( this.cookieService.get('roleType') === Constant.superAdmin){
      this.isSuperadmin = true;
    }else if( this.cookieService.get('roleType') === Constant.admin){
      this.isAdmin = true;
      this.isSuperadmin = true;
    }else if( this.cookieService.get('roleType') === Constant.teamLeader){
      this.isTeamLeader = true;
    }
  }

  createForms() {
    this.editUserForm = this.fb.group({
      loginId: [''],
      firstName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      lastName: ['', [Validators.required, Validators.pattern("[1-9]{1}[0-9]{9}")]],
      roleType: [''],
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
    this.getAddressDetailsByUserId(user);
  
    // Create a copy of the addressList from userAddressList
    const addressListCopy = [...this.userAddressList];
  
    // Ensure the addressForm array matches the userAddressList
    while (this.addressList.length < addressListCopy.length) {
      this.addressList.push(this.addressForm());
    }
  
    for (let i = 0; i < addressListCopy.length; i++) {
      const addressGroup = this.addressList.at(i) as FormGroup;
      const address = addressListCopy[i];
  
      // Update the values in the addressForm
      addressGroup.patchValue({
        addressType: address.addressType,
        addressLine: address.addressLine,
        landmark: address.landmark,
        district: address.district,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
      });
    }

    // Format the dob (if required)
    const formattedDob = user['dob']
      ? new Date(user['dob']).toISOString().split('T')[0]
      : 'DD-MM-YYYY'; // Convert to YYYY-MM-DD or leave blank
  
    // Patch values into the editUserForm
    this.editUserForm.patchValue({
      userPicture: user['userPicture'],
      loginId: user['loginId'],
      firstName: user['firstName'],
      lastName: user['lastName'],
      roleType: user['roleType'],
      mobileNo: user['mobileNo'],
      alternateMobile: user['alternateMobile'],
      emailId: user['emailId'],
      dob: formattedDob, // Use the formatted dob
      // permissions: user['permissions'],
      userPhoto: user['userPhoto'],
      createdBy: user['createdBy'],
      addressList: []
      
    });
  
    // Update the userPhoto for display
    this.userPhoto = user['userPicture']
      ? 'data:image/png;base64,' + user['userPicture']
      : '';
  
    // Open the dialog
    // this.dialog.open(templateRef);

    this.userUpdateDialog = this.dialog.open(templateRef, {
      width: '1400px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });
  }
  

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
    // this.loginUser = this.authenticationService.getLoginUser();
  }


  ngOnInit() {
    this.getUserDetails();
    this.createForms();
    // this.checkRoleType();
    this.getUserRoleType();
    this.getTeamleaderList();
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

  permissionsList: data[] =[
    { value: 'admin-dashboard', name: 'Lead Dashboard' },
    { value: 'sale-dashboard', name: 'Donation Dashboard' },
    { value: 'create-user', name: 'Create User' },
    { value: 'user-list', name: 'User List' },
    { value: 'create-lead', name: 'Create Lead' },
    { value: 'lead-list', name: 'Lead List' },
    { value: 'general-setting', name: 'General Setting' },
    { value: 'company-setting', name: 'Company Setting' }
  ];

  public getUserDetailsByRoleType(roleType: any): void {
    this.serialNumberArray = []; // Clear serial number array before fetching new data
  
    this.userManagementService.getUserDetailsByRoleType(roleType).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber; // Set total data count
      this.fullData = apiRes.listPayload;  // Store the full dataset
  
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.users) {
          this.pageSize = res.pageSize;
          // Use the full dataset for pagination
          this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  public getUserDetails(): void {
    this.serialNumberArray = []; // Clear serial number array before fetching new data
  
    this.userManagementService.getUserDetailsList().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber; // Set total data count
      this.fullData = apiRes.listPayload;  // Store the full dataset
  
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.users) {
          this.pageSize = res.pageSize;
          // Use the full dataset for pagination
          this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
          this.pageSize = res.pageSize;
        }
      });
    });
  }
  
    prepareTableData(apiRes: any[], pageOption: pageSelection): void {
      this.tableData = []; // Reset table data
      this.serialNumberArray = []; // Reset serial numbers
    
      // Slice data based on pagination limits (skip, limit)
      const dataToDisplay = apiRes.slice(pageOption.skip, pageOption.limit);
    
      // Add serial numbers and prepare table data
      dataToDisplay.forEach((res: any, index: number) => {
        const serialNumber = index + 1;
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
      const searchTerm = value.trim().toLowerCase();
  
      if (searchTerm) {
        // Filter the full dataset based on the search term
        const filteredData = this.fullData.filter((donation: UserDetails) =>
          Object.values(donation).some((field) =>
            String(field).toLowerCase().includes(searchTerm)
          )
        );
  
        this.prepareTableData(filteredData, { skip: 0, limit: this.pageSize });
        this.totalData = filteredData.length; // Update total data count for pagination
      } else {
        // Reset to the full dataset when the search term is cleared
        this.prepareTableData(this.fullData, { skip: 0, limit: this.pageSize });
        this.totalData = this.fullData.length; // Reset the total data count
      }
  
      // Reset to the first page after a search or clearing search
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
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
  confirmColor() {
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
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
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

  public getAddressDetailsByUserId(user:any) {
    this.userAddressList ;
    this.userManagementService.getAddressDetailsByUserId(user)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.userAddressList = JSON.parse(JSON.stringify(response['listPayload']));
            // this.toastr.success(response['status'], response['responseCode']);
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
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
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part

        // Set the base64 string to the userPicture field
        this.editUserForm.patchValue({
          userPicture: base64String
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  updateUserDetails() {
    this.userManagementService.updateUserDetails(this.editUserForm.value).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {

            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'success-background-popover',
            });

            this.userUpdateDialog.close();

          } else {
            this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });

              this.userUpdateDialog.close();
          }
        } else {
          this.messageService.add({
            summary: response['payload']['respCode'],
            detail: response['payload']['respMesg'],
            styleClass: 'danger-background-popover',
          });
          this.userUpdateDialog.close();
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
}
