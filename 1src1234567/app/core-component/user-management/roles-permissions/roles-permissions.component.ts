import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  routes,
} from 'src/app/core/core.index';
import { SidebarService } from 'src/app/core/service/sidebar/sidebar.service';
import { rolesPermissions } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { UserManagementService } from '../user-management.service';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { Constant } from 'src/app/core/constant/constants';

interface data {
  value: string;
}

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.scss',
})
export class RolesPermissionsComponent {

  public changePasswordBtnMessage ="Submit";
  public changePasswordBtn: boolean = false;
  public changeUserPasswordForm!: FormGroup;
  public changeRoleBtnMessage = "Submit";
  public changeUserRoleBtn: boolean = false;
  public changeUserRoleForm!: FormGroup;
  public changeTeamLeaderBtnMessage = "Submit";
  public changeTeamLeaderBtn: boolean = false;
  public changeTeamLeaderForm!: FormGroup;
  public isLoading = false;
  public loginUser: any;
  public userList: any;
  public teamLeaderList: any;
  public userRoleList: any;

  initChecked = false;
  public routes = routes;
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  public selectedValue1 = '';
  public selectedValue2 = '';

  selectedList1: data[] = [
    { value: 'Sort by Date' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];
  selectedList2: data[] = [
    { value: 'Choose Role' },
    { value: 'Admin' },
    { value: 'Shop Owner' },
  ];
  // pagination variables
  public tableData: Array<rolesPermissions> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<rolesPermissions>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private fb: FormBuilder,
    private userManagementService: UserManagementService
  ) {
    this.data.getDataTable().subscribe((apiRes: apiResultFormat) => {
      this.totalData = apiRes.totalData;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.rolesPermission) {
          this.getTableData({ skip: res.skip, limit: this.totalData  });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.getRolesPermissions().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: rolesPermissions, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.sNo = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<rolesPermissions>(
        this.tableData
      );
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
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
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

  ngOnInit() {
    this.createForms();
    this.getUserDetailsList();
    this.getTeamleaderList();
    this.getRoleType();
  }

  getRoleType(){
    this.userRoleList = [{value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}, { value: Constant.donorExecutive, name: 'Donation Executive'}];

  }

  createForms() {
    this.changeUserPasswordForm = this.fb.group({
      loginId: [''],
      password: [''],
    });
    this.changeUserRoleForm = this.fb.group({
      loginId: [''],
      roleType: [''],
    });
    this.changeTeamLeaderForm = this.fb.group({
      loginId: [''],
      teamLeaderId: [''],
    });
  }

  public getUserDetailsList() {
    this.userManagementService.getUserDetailsList()
      .subscribe({
        next: (response: any) => {
         
          if (response['responseCode'] == '200') {
            this.userList = JSON.parse(JSON.stringify(response['listPayload']));
            
          } else {
           
          }
         
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  public getTeamleaderList() {
    this.userManagementService.getTeamleaderList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.teamLeaderList = JSON.parse(JSON.stringify(response['listPayload']));
          } else {
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  // public getFundrisingOfficersList() {
  //   this.userManagementService.getFundrisingOfficersList()
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response['responseCode'] == '200') {
  //           this.teamLeaderList = JSON.parse(JSON.stringify(response['listPayload']));
  //           console.log(this.teamLeaderList)
  //         } else {
  //         }
  //       },
  //       error: (error: any) => this.toastr.error('Server Error', '500'),
  //     });
  // }

  

  public changePassword(){
      this.isLoading = true;
      this.changePasswordBtnMessage = "Processing Wait.."
      this.changePasswordBtn = true;
      this.userManagementService.changeUserPassword(this.changeUserPasswordForm.value)
        .subscribe({
          next: (response: any) => {
            if (response['responseCode'] == '200') {
              if (response['payload']['respCode'] == '200') {
                
                this.changeUserPasswordForm.reset();
                this.createForms();
                this.changePasswordBtnMessage = "Submit"
                this.changePasswordBtn = false;
                this.isLoading = false;
              } else {
                // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
                this.isLoading = false;
                this.changePasswordBtnMessage = "Submit"
                this.changePasswordBtn = false;
                
              }
            } else {
              // this.toastr.error(response['responseMessage'], response['responseCode']);
              this.isLoading = false;
              this.changePasswordBtnMessage = "Submit"
                this.changePasswordBtn = false;
            }
          },
          // error: (error: any) => this.toastr.error('Server Error', '500'),
        });
        // this.isLoading = false;
  }

  public changeTeamLeader(){
    this.isLoading = true;
    this.changeTeamLeaderBtnMessage= "Processing wait.."
    this.changeTeamLeaderBtn = true;
    this.userManagementService.changeTeamLeader(this.changeTeamLeaderForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.changeUserRoleForm.reset();
              this.createForms();
              this.changeTeamLeaderBtnMessage = "Submit";
              this.changeTeamLeaderBtn = false;
              this.isLoading = false;
            } else {
              // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
              this.isLoading = false;
              this.changeTeamLeaderBtnMessage = "Submit";
              this.changeTeamLeaderBtn = false;
            }
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
            this.isLoading = false;
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
      this.isLoading = false;
  }

  public changeUserRole(){
    this.isLoading = true;
    this.changeRoleBtnMessage = "Processing Wait.."
    this.changeUserRoleBtn = true;
    this.userManagementService.changeUserRole(this.changeUserRoleForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.changeUserRoleForm.reset();
              this.createForms();
              this.changeRoleBtnMessage = "Submit"
              this.changeUserRoleBtn = false;
              this.isLoading = false;
            } else {
              // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
              this.isLoading = false;
              this.changeRoleBtnMessage = "Submit"
              this.changeUserRoleBtn = false;
            }
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
            this.isLoading = false;
            this.changeRoleBtnMessage = "Submit"
            this.changeUserRoleBtn = false;
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
      this.isLoading = false;
  }


}
