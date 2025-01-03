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
import {MatTabsModule} from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { DatePipe } from '@angular/common';
import { DonationDetails } from 'src/app/core-component/interface/donation-management'; 


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
  public followupList: any;
  public userForDropDown : any[]=[];
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];
  filteredPickLocationList: any[] =[];
  filteredDropLocationList: any[] =[];

  public routes = routes;
  public leadList: any;

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
  roleType: string = '';
  //** / pagination variables
  viewLeadDetailsDialog: any;
  firstDate: any = '';
  lastDate: any = '';
  leadDetails = {
    categoryType: '',
    superCategory: '',
    category: '',
    subCategory: '',
    pickupDateTime: '',
    pickupLocation: '',
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
    records: '',
    remarks: '',
    reminderDate: '',
  };
  isEditForm: boolean = false;
  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];

  allIds = {
    superCategoryId: '',
    categoryTypeId: '',
  }

  
  public userList: any[] = [];
  leadOrigine: listData[] = Constant.LEAD_ORIGINE_LIST;
  leadType: listData[] = Constant.LEAD_TYPE_LIST;
  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService,
    private dialog: MatDialog,
    private helper: HelperService,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
    private cookieService: CookieService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.getAllLeadList("MONTH");
    this.getUserListForDropDown();
    // this.getCategoryType();
    // this.getPickLocation();
    // this.getDropLocation();
    
  }

  // downloadInvoice(receiptNo : string) {
  //   window.open(Constant.Site_Url+"paymentreceipt/"+receiptNo, '_blank');
  // }


  public getUserListForDropDown() {
    this.userManagementService.getUserListForDropDown().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.userForDropDown = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  onAgentSelectionChange(dd:any){
    // this.leadManagementService.getAllLeadList('AGENT').subscribe((apiRes: any) => {
      // this.setTableData(apiRes);
    // });
  }

  getAllLeadList(tabName:any) {
    this.leadManagementService.getAllLeadList(this.cookieService.get('roleType'), tabName).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.allLead) {
          this.getTableData({ skip: res.skip, limit: (res.skip)+ this.pageSize },tabName);
          this.pageSize = res.pageSize;
        }
      });
    });
  }

   private getTableData(pageOption: pageSelection, tabName: any): void {
    this.leadManagementService.getAllLeadList(this.cookieService.get('roleType'), tabName).subscribe((apiRes: any) => {
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

  // async openEditModal(
  //   templateRef: TemplateRef<any>,
  //   rawData: any,
  //   isEditable: boolean
  // ) {
  //   this.isEditForm = isEditable;
  //   await this.getDropdownOnEditModal(rawData);
  //   // this.saveLeadData(rawData);
  //   this.viewLeadDetailsDialog = this.dialog.open(templateRef, {
  //     width: '80%',
  //   });
  // }

  // async getDropdownOnEditModal(rawData: any) {
  //   const filterCategoryType: any = this.categoryTypeList.filter((item) => {
  //     if (item?.categoryTypeName === rawData?.categoryTypeName) {
  //       return item;
  //     }
  //   });
  //   await this.getSuperCategory({
  //     value: filterCategoryType[0]?.id,
  //   });
  //   const filterSuperCategory: any = this.superCategoryList.filter((item) => {
  //     if (item?.superCategory === rawData?.superCategory) {
  //       return item;
  //     }
  //   });
  //   await this.getCategory({ value: filterSuperCategory[0]?.id });
  //   const filterCategory: any = this.categoryList.filter((item) => {
  //     if (item?.category === rawData?.category) {
  //       return item;
  //     }
  //   });
  //   await this.getSubCategory({ value: filterSuperCategory[0]?.id });
  //   const filterSubCategory: any = this.categoryList.filter((item) => {
  //     if (item?.category === rawData?.subCategory) {
  //       return item;
  //     }
  //     console.log(
  //       filterCategoryType,
  //       filterSuperCategory,
  //       filterCategory,
  //       filterSubCategory
  //     );
  //   });
  // }

  setDateTime(date: any): string {
    // const currentDate = new Date(date);
  
    // const year = currentDate.getFullYear();
    // const month = String(currentDate.getMonth() + 1).padStart(2, '0');  // Months are zero-indexed
    // const day = String(currentDate.getDate()).padStart(2, '0');
    // const hours = String(currentDate.getHours()).padStart(2, '0');
    // const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    // const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    const currentDate = new Date(date);

    // Adjust to local time zone
    const timeZoneOffset = currentDate.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(currentDate.getTime() - timeZoneOffset);

    // Round minutes to the nearest 15-minute interval
    const minutes = localDate.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    localDate.setMinutes(roundedMinutes);
    localDate.setSeconds(0);
    localDate.setMilliseconds(0);

    // Format the date to the required input format: YYYY-MM-DDTHH:MM
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutesFormatted = String(localDate.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutesFormatted}`;

    return formattedDateTime;
  }

  
  async copyData(data: any, idx: number) {
    // this.saveLeadData(data);
    this.helper.copyData(this.leadDetails);
    this.setIsDataCopied(true, idx);
  }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.tableData = this.dataSource.filteredData;
  }

  setIsDataCopied(val: boolean, idx: number) {
    for (const element of this.tableData) {
      element.isDataCopied = false;
    }
    this.tableData[idx]['isDataCopied'] = val;
  }


  // public getPickLocation() {
  //   this.categoriesManagementService.getLocationByType('PICK').subscribe({
  //     next: (response: any) => {
  //       if (response['responseCode'] == '200') {
  //         this.pickLocationList = JSON.parse(
  //           JSON.stringify(response.listPayload)
  //         );
  //         this.filteredPickLocationList = this.pickLocationList;
  //       }
  //     },
  //     error: (error: any) =>
  //       this.messageService.add({
  //         summary: '500',
  //         detail: 'Server Error',
  //         styleClass: 'danger-background-popover',
  //       }),
  //   });
  // }

  // public getDropLocation() {
  //   this.categoriesManagementService.getLocationByType('DROP').subscribe({
  //     next: (response: any) => {
  //       if (response['responseCode'] == '200') {
  //         this.dropLocationList = JSON.parse(
  //           JSON.stringify(response.listPayload)
  //         );
  //         this.filteredDropLocationList = this.dropLocationList;
  //       }
  //     },
  //     error: (error: any) =>
  //       this.messageService.add({
  //         summary: '500',
  //         detail: 'Server Error',
  //         styleClass: 'danger-background-popover',
  //       }),
  //   });
  // }

  // public getCategoryType() {
  //   this.categoriesManagementService.getCategoryTypeList().subscribe({
  //     next: (response: any) => {
  //       if (response['responseCode'] == '200') {
  //         this.categoryTypeList = JSON.parse(JSON.stringify(response.listPayload));
  //         this.filteredCategoryTypeList = this.categoryTypeList;
  //       }
  //     },
  //     error: (error: any) =>
  //       this.messageService.add({
  //         summary: '500',
  //         detail: 'Server Error',
  //         styleClass: 'danger-background-popover',
  //       }),
  //   });
  // }

  // public getSuperCategory(superCateId: any) {
  //   this.categoriesManagementService.getSuperCategoryListByCategoryTypeId(superCateId)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response['responseCode'] == '200') {
  //           this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload));

  //           this.filteredSuperCategoryList = this.superCategoryList;

  //           const category = this.superCategoryList.find(item => item.superCategory === this.leadDetails.superCategory);
  //           this.getCategory(category.id)
  //         }
  //       },
  //       error: (error: any) =>
  //         this.messageService.add({
  //           summary: '500',
  //           detail: 'Server Error',
  //           styleClass: 'danger-background-popover',
  //         }),
  //     });
  // }
  

  // public getCategory(categoryId: any) {
  //   this.categoriesManagementService.getCategoryBySuperCatId(categoryId)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response['responseCode'] == '200') {
  //           this.categoryList = JSON.parse( JSON.stringify(response.listPayload));
  //           this.filteredCategoryList = this.categoryList;

  //           const subCategory = this.categoryList.find(item => item.category === this.leadDetails.category);
  //           this.getSubCategory(subCategory.id);
  //         }
  //       },
  //       error: (error: any) =>
  //         this.messageService.add({
  //           summary: '500',
  //           detail: 'Server Error',
  //           styleClass: 'danger-background-popover',
  //         }),
  //     });
  // }

  // public getSubCategory(subCategoryId: any) {
  //   this.categoriesManagementService.getSubCategoryListByCatId(subCategoryId)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response['responseCode'] == '200') {
  //           this.subCategoryList = JSON.parse(JSON.stringify(response.listPayload));
  //           this.subCategoryList.forEach(subCategory => {
  //           });
  //           this.filteredSubCategoryList = this.subCategoryList;
  //         }
  //       },
  //       error: (error: any) =>
  //         this.messageService.add({
  //           summary: '500',
  //           detail: 'Server Error',
  //           styleClass: 'danger-background-popover',
  //         }),
  //     });
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
  setFilterList(listVal: any, typeOfList: any) {
    switch (typeOfList) {
      case 'categoryType':
        this.filteredCategoryTypeList = listVal;
        break;
      case 'superCategory':
        this.filteredSuperCategoryList = listVal;
        break;
      case 'category':
        this.filteredCategoryList = listVal;
        break;
      case 'subCategory':
        this.filteredSubCategoryList = listVal;
        break;
      default:
        break;
    }
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

    // this.firstDate = new Date().toISOString().slice(0, 16);
    // this.lastDate = new Date().toISOString().slice(0, 16);
  }
  updateLeadDetails() {
    this.leadManagementService.updateLeadDetails(this.leadDetails).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            // form.reset();
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
