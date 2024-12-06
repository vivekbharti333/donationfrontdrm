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
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';

  isEditForm: boolean = false;
  viewChangeStatusDialog: any;
  followupDetails = {
    categoryType: '',
    superCategory: '',
    category: '',
    subCategory: '',
    pickUpDateTime: '',
    pickUpLocation: '',
    dropDateTime: '',
    dropLocation: '',
    totalDays: '',
    quantity: '',
    vendorRate: '',
    companyRate: '',
    bookingAmount: '',
    balanceAmount: '',
    totalAmount: '',
    securityAmount: '',
    payToVendor: '',
    payToCompany: '',
    deliveryToCompany: '',
    deliveryToVendor: '',
    customerName: '',
    dialCode: '',
    mobile: '',
    alternateMobile: '',
    emailId: '',
    id: '',
    companyName: '',
    enquirySource: '',
    pickupPoint: '',
    dropPoint: '',
    status: '',
    leadOrigine: '',
    leadType: '',
    createdBy: '',
    notes: '',
  };



  constructor(
    // private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService,
    private helper: HelperService,
    private dialog: MatDialog,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
  ) { }

  ngOnInit() {
    (async () => {
      await
        this.getFollowupList1();
      // this.getUserListForDropDown();
      // this.getCategoryType();
    })();
  }

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




  setFollowupData(rawData: any) {
    const pickup = new Date(rawData?.pickupDateTime);
    const drop = new Date(rawData?.dropDateTime);
    const pickupDateTime = `${this.helper.addZeroInDateTime(
      pickup.getDate()
    )}-${this.helper.addZeroInDateTime(
      pickup.getMonth() + 1
    )}-${pickup.getFullYear()} ${this.helper.addZeroInDateTime(
      pickup.getHours()
    )}:${pickup.getMinutes()}`;
    const dropDateTime = `${this.helper.addZeroInDateTime(
      drop.getDate()
    )}-${this.helper.addZeroInDateTime(
      drop.getMonth() + 1
    )}-${drop.getFullYear()} ${this.helper.addZeroInDateTime(
      drop.getHours()
    )}:${drop.getMinutes()}`;
    this.followupDetails = {
      categoryType: rawData?.categoryTypeName,
      superCategory: rawData?.superCategory,
      category: rawData?.category,
      subCategory: rawData?.subCategory,
      pickUpDateTime: pickupDateTime,
      pickUpLocation: rawData?.pickupLocation,
      dropDateTime: dropDateTime,
      dropLocation: rawData?.dropLocation,
      totalDays: rawData?.totalDays,
      quantity: rawData?.quantity,
      vendorRate: rawData?.vendorRate,
      companyRate: rawData?.companyRate,
      bookingAmount: rawData?.bookingAmount,
      balanceAmount: rawData?.balanceAmount,
      totalAmount: rawData?.totalAmount,
      securityAmount: rawData?.securityAmount,
      payToVendor: rawData?.payToVendor,
      payToCompany: rawData?.payToCompany,
      deliveryToCompany: rawData?.deliveryAmountToCompany,
      deliveryToVendor: rawData?.deliveryAmountToVendor,
      customerName: rawData?.customeName,
      dialCode: rawData?.countryDialCode,
      mobile: rawData?.customerMobile,
      alternateMobile: '',
      emailId: rawData?.customerEmailId,
      id: rawData?.id,
      companyName: rawData?.companyName,
      enquirySource: rawData?.enquirySource,
      pickupPoint: rawData?.pickupPoint,
      dropPoint: rawData?.dropPoint,
      status: rawData?.status,
      leadOrigine: rawData?.leadOrigine,
      leadType: rawData?.leadType,
      createdBy: rawData?.createdBy,
      notes: rawData?.notes,
    };
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

  getFollowupList2() {
    // Function to format a Date object as YYYY-MM-DD
    function formatDate(date: Date): string {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, '0');
      let day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    let todayDate = new Date();

    let firstDate = new Date(todayDate);
    firstDate.setDate(todayDate.getDate() - 1);
    let firstDayString = formatDate(firstDate);

    let lastDate = new Date(todayDate);
    lastDate.setDate(todayDate.getDate());
    let lastDayString = formatDate(lastDate);

    // Call the service with the formatted dates
    this.leadManagementService.getLeadListByDate(Constant.FOLLOWUP, firstDayString, lastDayString).subscribe((apiRes: any) => {
      this.setTableData(apiRes); // Process the API response
    });
  }


  getFollowupList3() {
    // Function to format a Date object as YYYY-MM-DD
    function formatDate(date: Date): string {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, '0');
      let day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    let todayDate = new Date();

    let firstDate = new Date(todayDate);
    firstDate.setDate(todayDate.getDate() - 2);
    let firstDayString = formatDate(firstDate);

    let lastDate = new Date(todayDate);
    lastDate.setDate(todayDate.getDate() -1 );
    let lastDayString = formatDate(lastDate);

    // Call the service with the formatted dates
    this.leadManagementService.getLeadListByDate(Constant.FOLLOWUP, firstDayString, lastDayString).subscribe((apiRes: any) => {
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
            // this.setIsDataCopied(false, index);
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
        // this.pageSize = res.pageSize;
      }
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
    this.setFollowupData(rawData);
    this.viewChangeStatusDialog = this.dialog.open(templateRef, {
      width: '40%',
    });
  }

  changeLeadStatus() {
    this.viewChangeStatusDialog.close();
    this.leadManagementService.changeLeadStatus(this.followupDetails)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // this.getEnquiryList();
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

}