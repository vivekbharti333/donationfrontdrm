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
import { LeadManagementService } from '../../lead-management.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/service/helper.service';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { UserManagementService } from '../../../user-management/user-management.service';
import { MatTabsModule } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { DatePipe } from '@angular/common';
import { DonationDetails } from 'src/app/core-component/interface/donation-management';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


interface listData {
  value: string;
  name: string;
}

@Component({
  selector: 'app-all-lead',
  templateUrl: './all-lead.component.html',
  styleUrl: './all-lead.component.scss',
  providers: [MessageService, ToastModule],
})

export class AllLeadComponent {

  public editLeadForm!: FormGroup;
  public leadUpdateDialog: any;
  public showFollowupDateBox: boolean = false;
  public minDate: any;

  public customeLeadList: any;


  public followupList: any;
  public userForDropDown: any[] = [];
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];
  filteredPickLocationList: any[] = [];
  filteredDropLocationList: any[] = [];

  public routes = routes;
  public leadList: any;

  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 10;
  public pageNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<DonationDetails>;
  public searchDataValue = '';
  roleType: string = '';
  // pagination variables

  firstDate: any = '';
  lastDate: any = '';

  public currentMonthName!: string;
  isEditForm: boolean = false;


  public userList: any[] = [];
  leadOrigine: listData[] = Constant.LEAD_ORIGINE_LIST;
  leadType: listData[] = Constant.LEAD_TYPE_LIST;
  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

  constructor(
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService,
    private dialog: MatDialog,
    private userManagementService: UserManagementService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.createForms();
    this.getAllLeadList("TODAY");
    this.getUserListForByRoleType();

    const currentDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.currentMonthName = months[currentDate.getMonth()];
  }


  public getUserListForByRoleType() {
    this.userManagementService.getUserListForByRoleType(Constant.donorExecutive).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.userForDropDown = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500'+error,
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  onAgentSelectionChange(dd: any) {
    // this.leadManagementService.getAllLeadList('AGENT').subscribe((apiRes: any) => {
    // this.setTableData(apiRes);
    // });
  }



  getAllLeadList(tabName: string): void {    
    this.leadManagementService.getAllLeadList(tabName).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber; // Ensure totalData reflects the total count
  
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.allLead) {
          this.pageSize = res.pageSize;
  
          // Use the received data for table and pagination calculations
          this.updateTableData(apiRes, { skip: res.skip, limit: res.skip + this.pageSize });
        }
      });
    });
  }
  
  getLeadListByDate(firstDate: any, lastDate: any, tabName: string): void {
    const lastDateObj = new Date(lastDate);
    lastDateObj.setDate(lastDateObj.getDate() + 1); // Increment lastDate by 1 day
    
    // Format lastDate based on the expected format in API
    const formattedLastDate = lastDateObj.toISOString(); // Change this if another format is required
  
    this.leadManagementService.getAllLeadList(tabName, firstDate, formattedLastDate).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber; // Ensure total count is updated
  
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.allLead) {
          this.pageSize = res.pageSize;
  
          // Use the received data for table and pagination calculations
          this.updateTableData(apiRes, { skip: res.skip, limit: res.skip + this.pageSize });
        }
      });
    });
  }
  
  private updateTableData(apiRes: any, pageOption: pageSelection): void {
    // Ensure listPayload exists before proceeding
    this.leadList = apiRes.listPayload ?? [];
    this.tableData = [];
    this.pageNumberArray = [];
  
    // Paginate the data locally without making another API call
    this.leadList.forEach((res: DonationDetails, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        this.tableData.push(res);
        this.pageNumberArray.push(serialNumber);
      }
    });
  
    // Update the data source and pagination
    this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.pageNumberArray,
    });
  }
  
  public searchData(value: string): void {
    const searchTerm = value.trim().toLowerCase();
  
    // Ensure search is performed only when data exists
    if (!this.leadList || this.leadList.length === 0) {
      return;
    }
  
    // Filter the entire dataset (leadList) instead of just paginated data
    const filteredData = this.leadList.filter((lead: DonationDetails) =>
      Object.values(lead)
        .filter((field) => field !== null && field !== undefined) // Remove null/undefined values
        .some((field) => field.toString().toLowerCase().includes(searchTerm))
    );
  
    // Update the tableData and reinitialize pagination
    this.tableData = filteredData;
    this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);
  
    // Update pagination based on filtered results
    this.pagination.calculatePageSize.next({
      totalData: this.tableData.length,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.tableData.map((_, index) => index + 1),
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

  setIsDataCopied(val: boolean, idx: number) {
    for (const element of this.tableData) {
      element.isDataCopied = false;
    }
    this.tableData[idx]['isDataCopied'] = val;
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

  filterByDate() {
    this.leadManagementService
      .getAllLeadListByDate(this.firstDate, this.lastDate)
      .subscribe((apiRes: any) => {
        // this.setTableData(apiRes);
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

    if (this.editLeadForm.value['status'] == "FOLLOWUP") {
      this.showFollowupDateBox = true;
    }

    this.leadUpdateDialog = this.dialog.open(templateRef, {
      width: '1400px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });

  }

  checkStatus(status: any) {
    this.showFollowupDateBox = false;
    if (status.value == "FOLLOWUP") {
      this.showFollowupDateBox = true;
    }
  }


  updateLeadDetails() {
    this.leadManagementService.updateLeadDetails(this.editLeadForm.value).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {

            this.getAllLeadList('MONTH');

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
