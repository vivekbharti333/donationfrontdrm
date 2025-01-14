import { Component, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  // DataService,
  pageSelection,
  // apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
// import Swal from 'sweetalert2';
import { LeadManagementService } from '../../lead-management.service';
// import { UserManagementService } from '../user-management.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HelperService } from 'src/app/core/service/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { UserManagementService } from '../../../user-management/user-management.service';
import { DonationDetails } from 'src/app/core-component/interface/donation-management';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

import {MatTabsModule} from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';



interface listData {
  value: string;
  name: string;
}

@Component({
  selector: 'app-followup-lead',
  templateUrl: './followup-lead.component.html',
  styleUrl: './followup-lead.component.scss',
  providers: [MessageService, ToastModule],
})
export class FollowupLeadComponent {
  public followupList: any;
  public userForDropDown: any[] = [];

  public routes = routes;
  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

  firstDate: any = '';
  lastDate: any = '';
  public leadList: any;
  public leadUpdateDialog: any;
  public minDate: any;
  public showFollowupDateBox: boolean =false;

  // pagination variables
  public tableData: Array<any> = [];
  public categoryTypeList: Array<any> = [];
  public superCategoryList: Array<any> = [];
  public categoryList: Array<any> = [];
  public subCategoryList: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<DonationDetails>;
  public searchDataValue = '';
  public editLeadForm!: FormGroup;

  isEditForm: boolean = false;
  viewChangeStatusDialog: any;


  ngOnInit() {
    (async () => {
      await
        this.getFollowupList1();
        this.getFollowupLeadList('TODAY');
      this.createForms();
      // this.getCategoryType();
    })();
  }

  constructor(
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) { }



  filterByDate() {
    this.leadManagementService
      .getLeadListByDate(Constant.LOST, this.firstDate, this.lastDate)
      .subscribe((apiRes: any) => {
        this.setTableData(apiRes);
      });
  }
  setFilterDate(eve: any, date: any) {
    if (date === 'first') {
      this.firstDate = eve.target.value;
    }
    if (date === 'last') {
      this.lastDate = eve.target.value;
    }
  }

  onAgentSelectionChange(dd: any) {
    alert(dd)
  }


  getFollowupList1() {
    // Function to format a Date object as YYYY-MM-DD
    function formatDate(date: Date): string {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      let day = String(date.getDate()).padStart(2, '0'); // Ensures 2-digit format
      return `${year}-${month}-${day}`;
    }
    let currentDate = new Date();
    let dateString = formatDate(currentDate); // Format the current date as YYYY-MM-DD

    let nextDate = new Date(currentDate); // Clone the current date
    nextDate.setDate(currentDate.getDate() + 1); // Add 1 day
    let nextDayString = formatDate(nextDate); // Format the next date as YYYY-MM-DD

    // Call the service with the formatted dates
    this.leadManagementService.getLeadListByDate(Constant.FOLLOWUP, dateString, nextDayString).subscribe((apiRes: any) => {
      this.setTableData(apiRes); // Process the API response
    });
  }


  setTableData(apiRes: any) {
    this.tableData = [];
    this.serialNumberArray = [];
    this.totalData = apiRes.totalNumber;
    this.pagination.tablePageSize.subscribe((pageRes: tablePageSize) => {
      if (this.router.url == this.routes.folloupLead) {
        apiRes.listPayload.map((res: any, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageRes.skip && serialNumber <= this.totalData) {
            this.tableData.push(res);
            this.serialNumberArray.push(serialNumber);
          }
        });
        this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);
        const dataSize = this.tableData.length;
        this.pagination.calculatePageSize.next({
          totalData: this.totalData,
          pageSize: this.pageSize,
          tableData: this.tableData,
          serialNumberArray: this.serialNumberArray,
        });
        this.pageSize = apiRes.totalNumber;
      }
    });
  }

  getFollowupLeadList(tabName:any) {

     // Function to format a Date object as YYYY-MM-DD
     function formatDate(date: Date): string {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      let day = String(date.getDate()).padStart(2, '0'); // Ensures 2-digit format
      return `${year}-${month}-${day}`;
    }
    let currentDate = new Date();
    let dateString = formatDate(currentDate); // Format the current date as YYYY-MM-DD

    let nextDate = new Date(currentDate); // Clone the current date
    nextDate.setDate(currentDate.getDate() + 1); // Add 1 day
    let nextDayString = formatDate(nextDate); // Format the next date as YYYY-MM-DD

    // Call the service with the formatted dates
    this.leadManagementService.getLeadListByDate(Constant.FOLLOWUP, dateString, nextDayString).subscribe((apiRes: any) => {
     


      // this.leadManagementService.getAllLeadList(this.cookieService.get('roleType'), tabName).subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.folloupLead) {
            this.getTableData({ skip: res.skip, limit: (res.skip)+ this.pageSize },tabName, dateString, nextDayString);
            
            this.pageSize = res.pageSize;
          }
        });
      });
    }
  
     private getTableData(pageOption: pageSelection, tabName: any, dateString: any, nextDayString: any): void {
      this.leadManagementService.getLeadListByDate(Constant.FOLLOWUP, dateString, nextDayString).subscribe((apiRes: any) => {
          this.leadList = apiRes.listPayload;
          this.tableData = [];
          this.serialNumberArray = [];
          this.totalData = apiRes.totalNumber;
          apiRes.listPayload.map((res: DonationDetails, index: number) => {
            const serialNumber = index + 1;
            if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
              this.tableData.push(res);
              this.serialNumberArray.push(serialNumber);
            }
          });
          this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);
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


  async openChangeStatusModal(templateRef: TemplateRef<any>, rawData: any, isEditable: boolean) {
    this.isEditForm = isEditable;
    // await this.getDropdownOnEditModal(rawData);
    // this.setFollowupData(rawData);
    this.viewChangeStatusDialog = this.dialog.open(templateRef, {
      width: '40%',
    });
  }

  createForms() {
    this.editLeadForm = this.fb.group({
      id: [''],
      donorName: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')]],
      mobileNumber: ['', [Validators.pattern('^[0-9]{10}$')]], // Assuming a 10-digit phone number   
      emailId: ['', [Validators.required, Validators.email]],
      programName: [''],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      currency: ['', [Validators.required]],
      status: ['', [Validators.required]],
      followupDate: [''],
      notes: [''],
    });
  }

    checkStatus(status: any){
    this.showFollowupDateBox = false;
    if( status.value == "FOLLOWUP"){
      this.showFollowupDateBox = true;
    }
  }

  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }

  setDateTime(date: any): string {
    // Use today's date if the input date is null or undefined
    const currentDate = date ? new Date(date) : new Date();
  
    // Adjust to local time zone
    const timeZoneOffset = currentDate.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(currentDate.getTime() - timeZoneOffset);
  
    // Round minutes to the nearest 15-minute interval
    const minutes = localDate.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    localDate.setMinutes(roundedMinutes);
    localDate.setSeconds(0);
    localDate.setMilliseconds(0);
  
    // Format the date to the required input format: YYYY-MM-DD
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`; // Returns in YYYY-MM-DD format
  }

  openEditModal(templateRef: TemplateRef<any>, rowData: any) {

    this.getTodayDate();

    this.editLeadForm.patchValue({
      id: rowData['id'],
      donorName: rowData['donorName'],
      mobileNumber: rowData['mobileNumber'],
      emailId: rowData['emailId'],
      status: rowData['status'],
      followupDate: this.setDateTime(rowData['followupDate']),
      programName: rowData['programName'],
      notes: rowData['notes'],
    });

    if( this.editLeadForm.value['status'] == "FOLLOWUP"){
      this.showFollowupDateBox = true;
    }

    this.leadUpdateDialog = this.dialog.open(templateRef, {
      width: '1400px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });
  }

  updateLeadDetails() {
    this.leadManagementService.updateLeadDetails(this.editLeadForm.value).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            
            this.getFollowupLeadList('TODAY');

            this.leadUpdateDialog.close();

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
  }

  getBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'win':
        return 'badge-linewin';
      case 'lost':
        return 'badge-linedanger';
      case 'info':
        return 'badge-lineinfo';
      case 'followup':
        return 'badge-linewarning';
      // case 'win':
      //   return 'badge-linewin';
      // case 'assigned':
      //   return 'badge-lineassigned';
      case 'OTHER':
        return 'badge-linereserved';
      default:
        return 'badge-default'; // Default class if no match
    }
  }

}