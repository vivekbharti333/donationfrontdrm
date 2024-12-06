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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';

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
  public addressList: any;

  public user = {
    userPicture: '',
    firstName: '',
    lastName: '',
    emailId: '',
    gender: '',
    permissions: '',
    roleType: '',
    mobileNo: '',
    alternateMobile: '',
    userCode: '',
    idDocumentType: '',
    idDocumentPicture: '',
    panNumber: '',
    dob: '',
    emergencyContactRelation1: '',
    emergencyContactName1: '',
    emergencyContactNo1: '',
    emergencyContactRelation2: '',
    emergencyContactName2: '',
    emergencyContactNo2: '',
    // addressList: [
    //   this.createAddress(),
    //   this.createAddress()
    // ]
    addressList: [
      {
        addressType: 'CURRENT',
        addressLine: '',
        landmark: '',
        district: '',
        city: '',
        state: '',
        country: 'INDIA',
        pincode: '',
      },
      {
        addressType: 'PARMANENT',
        addressLine: '',
        landmark: '',
        district: '',
        city: '',
        state: '',
        country: 'INDIA',
        pincode: '',
      },
    ],
  };

  onRoleTypeChange(event: any) {
    console.log('Selected gender:', event.value);
    this.getUserDetailsByRoleType(event.value);
    // Additional logic can be added here
  }

  openEditModal(templateRef: TemplateRef<any>, rowDate: any) {
    this.user.userPicture = rowDate.userPicture;
    this.user.firstName = rowDate.firstName; // Assign the value to user.firstName
    this.user.lastName = rowDate.lastName;
    this.user.gender = rowDate.gender;
    this.user.permissions = rowDate.permissions;
    this.user.emailId = rowDate.emailId;
    this.user.roleType = rowDate.roleType;
    this.user.mobileNo = rowDate.mobileNo;
    this.user.alternateMobile = rowDate.alternateMobile;
    this.user.userCode = rowDate.userCode;
    this.user.idDocumentType = rowDate.idDocumentType;
    this.user.idDocumentPicture = rowDate.idDocumentPicture;
    this.user.panNumber = rowDate.panNumber;
    this.user.emergencyContactRelation1 = rowDate.emergencyContactRelation1;
    this.user.emergencyContactName1 = rowDate.emergencyContactName1;
    this.user.emergencyContactNo1 = rowDate.emergencyContactNo1;
    this.user.emergencyContactRelation2 = rowDate.emergencyContactRelation2;
    this.user.emergencyContactName2 = rowDate.emergencyContactName2;
    this.user.emergencyContactNo2 = rowDate.emergencyContactNo2;
    this.getAddressListByUserId(rowDate.loginId);
    this.dialog.open(templateRef);
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
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private userManagementService: UserManagementService,
    private dialog: MatDialog
  ) {
    //   this.userManagementService.getUserDetailsList().subscribe((apiRes: any) => {
    //   this.totalData = apiRes.totalNumber;
    //   const stringRepresentation = JSON.stringify(apiRes);
    //   const dataSize = stringRepresentation.length;
    //   this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
    //     if (this.router.url == this.routes.users) {
    //       this.getTableData({ skip: res.skip, limit: this.totalData  });
    //       this.pageSize = res.pageSize;
    //     }
    //   });
    // });
  }

  ngOnInit() {
    this.getUserDetails();
  }

  genderType: data[] = [
    { value: '1', name: 'MALE' },
    { value: '2', name: 'FEMALE' },
    { value: '3', name: 'OTHER' },
  ];
  userType: data[] = [
    { value: '1', name: 'ADMIN' },
    { value: '2', name: 'TEAM LEADER' },
    { value: '3', name: 'SALE EXECUTIVE' },
  ];
  // permissionsList: data[] = [{ value: '1', name: 'admindb'}, {value: '2', name: 'admindbn'}, {value: '3', name: 'usermang'},{value: '3', name: 'usermang1'}];
  permissionsList: string[] = ['admindb', 'admindbn', 'usermang', 'usermang1'];

  getUserDetails() {
    this.userManagementService.getUserDetailsList().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      // const stringRepresentation = JSON.stringify(apiRes);
      // const dataSize = stringRepresentation.length;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.users) {
          this.getTableData({ skip: res.skip, limit: this.totalData }, 'ALL');
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  getUserDetailsByRoleType(roleType: any) {
    this.userManagementService
      .getUserDetailsByRoleType(roleType)
      .subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber;
        // const stringRepresentation = JSON.stringify(apiRes);
        // const dataSize = stringRepresentation.length;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.users) {
            this.getTableData(
              { skip: res.skip, limit: this.totalData },
              roleType
            );
            this.pageSize = res.pageSize;
          }
        });
      });
  }

  private getTableData(pageOption: pageSelection, roleType: any): void {
    var api;
    if (roleType === 'ALL') {
      api = this.userManagementService.getUserDetailsList();
    } else {
      api = this.userManagementService.getUserDetailsByRoleType(roleType);
    }

    api.subscribe((apiRes: any) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalNumber;
      apiRes.listPayload.map((res: any, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<users>(this.tableData);
      const dataSize = this.tableData.length;
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
      });
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
    this.dataSource.filter = value.trim().toLowerCase();
    this.tableData = this.dataSource.filteredData;
  }
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

  show() {
    this.messageService.add({
      summary: 'Toast',
      detail: 'Hello, world! This is a toast message.',
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
          this.addressList = JSON.parse(
            JSON.stringify(response['listPayload'])
          );
          alert('hghgg : ' + this.addressList);
          console.log(this.addressList);
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
        this.user.userPicture = 'data:image/jpeg;base64,' + base64String;
        alert('base64 : ' + this.user.userPicture);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  submitUserForm() {
    // this.isLoading = true;
    alert(this.user.userPicture);
    this.userManagementService.updateUserDetails(this.user).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
            // form.reset();
            // this.createForms();
            // this.isLoading = false;
          } else {
            // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
            // this.isLoading = false;
          }
        } else {
          // this.toastr.error(response['responseMessage'], response['responseCode']);
          // this.isLoading = false;
        }
      },
      // error: (error: any) => this.toastr.error('Server Error', '500'),
    });
    // this.isLoading = false;
  }
}
