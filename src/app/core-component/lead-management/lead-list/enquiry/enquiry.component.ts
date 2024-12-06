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
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrl: './enquiry.component.scss',
  providers: [MessageService, ToastModule],
})
export class EnquiryComponent {
  public followupList: any;
  public userForDropDown : any[]=[];

  public routes = routes;

  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

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
  //** / pagination variables
  viewEnquiryDetailsDialog: any;
  viewChangeStatusDialog: any;
  enquiryDetails = {
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
  isEditForm: boolean = false;
  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];
  firstDate: any = '';
  lastDate: any = '';

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
  ) {}

  ngOnInit() {
    (async () => {
      await 
      this.getEnquiryList();
      this.getUserListForDropDown();

      this.getCategoryType();
    })();
  }

  // getEnquiryList() {
  //   this.leadManagementService.getAllEnquiryList().subscribe((apiRes: any) => {
  //     this.totalData = apiRes.totalNumber;
  //     this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
  //       if (this.router.url == this.routes.enquiry) {
  //         this.getTableData({ skip: res.skip, limit: this.totalData });
  //         this.pageSize = res.pageSize;
  //       }
  //     });
  //   });
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
alert(dd)
  }

  getEnquiryList() {
    this.leadManagementService.getLeadListByStatus(Constant.ENQUIRY).subscribe((apiRes: any) => {
      this.setTableData(apiRes);
    });
  }

  setTableData(apiRes: any) {
    this.tableData = [];
    this.serialNumberArray = [];
    this.totalData = apiRes.totalNumber;
    this.pagination.tablePageSize.subscribe((pageRes: tablePageSize) => {
      if (this.router.url == this.routes.enquiry) {
        apiRes.listPayload.map((res: any, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageRes.skip && serialNumber <= this.totalData) {
            this.tableData.push(res);
            this.setIsDataCopied(false, index);
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

  async openEditModal( templateRef: TemplateRef<any>, rawData: any, isEditable: boolean ) {
    this.isEditForm = isEditable;
    await this.getDropdownOnEditModal(rawData);
    this.saveEnquiryData(rawData);
    this.viewEnquiryDetailsDialog = this.dialog.open(templateRef, {
      width: '80%',
    });
  }

  async openChangeStatusModal( templateRef: TemplateRef<any>, rawData: any, isEditable: boolean ) {
    this.isEditForm = isEditable;
    await this.getDropdownOnEditModal(rawData);
    this.saveEnquiryData(rawData);
    this.viewChangeStatusDialog = this.dialog.open(templateRef, {
      width: '40%',
    });
  }

  async getDropdownOnEditModal(rawData: any) {
    const filterCategoryType: any = this.categoryTypeList.filter((item) => {
      if (item?.categoryTypeName === rawData?.categoryTypeName) {
        return item;
      }
    });
    await this.getSuperCategory({
      value: filterCategoryType[0]?.id,
    });
    const filterSuperCategory: any = this.superCategoryList.filter((item) => {
      if (item?.superCategory === rawData?.superCategory) {
        return item;
      }
    });
    await this.getCategory({ value: filterSuperCategory[0]?.id });
    const filterCategory: any = this.categoryList.filter((item) => {
      if (item?.category === rawData?.category) {
        return item;
      }
    });
    await this.getSubCategory({ value: filterSuperCategory[0]?.id });
    const filterSubCategory: any = this.categoryList.filter((item) => {
      if (item?.category === rawData?.subCategory) {
        return item;
      }
      console.log(
        filterCategoryType,
        filterSuperCategory,
        filterCategory,
        filterSubCategory
      );
    });
  }


  saveEnquiryData(rawData: any) {
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
    this.enquiryDetails = {
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

  async copyData(data: any, idx: number) {
    this.saveEnquiryData(data);
    this.helper.copyData(this.enquiryDetails);
    this.setIsDataCopied(true, idx);
  }

  setIsDataCopied(val: boolean, idx: number) {
    for (const element of this.tableData) {
      element.isDataCopied = false;
    }
    this.tableData[idx]['isDataCopied'] = val;
  }
  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.filteredCategoryTypeList = this.categoryTypeList;
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

  public getSuperCategory(superCateId: any) {
    const categoryId = superCateId?.id;
    this.categoriesManagementService
      .getSuperCategoryListByCategoryTypeId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload)
            );
            this.filteredSuperCategoryList = this.superCategoryList;
          }
        },
        error: (error: any) =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
            styleClass: 'danger-background-popover',
          }),
      });
  }

  public getCategory(categoryId: any) {
    const superCatId = categoryId?.id;
    this.categoriesManagementService
      .getCategoryBySuperCatId(superCatId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.categoryList = JSON.parse(
              JSON.stringify(response.listPayload)
            );
            this.filteredCategoryList = this.categoryList;
          }
        },
        error: (error: any) =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
            styleClass: 'danger-background-popover',
          }),
      });
  }

  public getSubCategory(subCategoryId: any) {
    const categoryId = subCategoryId?.id;
    this.categoriesManagementService
      .getSubCategoryListByCatId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.subCategoryList = JSON.parse(
              JSON.stringify(response.listPayload)
            );
            this.filteredSubCategoryList = this.subCategoryList;
          }
        },
        error: (error: any) =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
            styleClass: 'danger-background-popover',
          }),
      });
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
      .getLeadListByDate(Constant.ENQUIRY,this.firstDate, this.lastDate)
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

  updateEnquiryDetails() {
    this.leadManagementService
      .updateLeadDetails(this.enquiryDetails)
      .subscribe({
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

  changeLeadStatus() {
    this.viewChangeStatusDialog.close();
  
    this.leadManagementService.changeLeadStatus(this.enquiryDetails)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.getEnquiryList();
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
