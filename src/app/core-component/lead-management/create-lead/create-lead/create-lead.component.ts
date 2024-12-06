import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { SidebarService, routes } from 'src/app/core/core.index'; // Ensure correct import path
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { LeadManagementService } from '../../lead-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';
import { SpinnerService } from 'src/app/core/core.index';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { CalendarModule } from 'primeng/calendar';

interface data {
  id: number;
  name: string;
}

interface su {
  id: number;
  name: string;
}

interface listData {
  value: string;
  name: string;
}

@Component({
  selector: 'app-create-lead',
  templateUrl: './create-lead.component.html',
  styleUrl: './create-lead.component.scss',
  providers: [MessageService, ToastModule, CalendarModule],
})
export class CreateLeadComponent {
  public loginUser: any;
  public selectedOption: string = 'lead';
  public categoryTypeList: any[] = [];
  public superCategoryList: any[] = [];
  public categoryList: any[] = [];
  public subCategoryList: any[] = [];
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];
  public userList: any[] = [];

  selectedDateTime: string = '';

  roleType: string = '';
  fullName: string = '';
  lead = {
    companyName: 'Notes',
    enquirySource: 'Call',
    categoryTypeId: '',
    superCategoryId: '',
    categoryId: '',
    subCategoryId: '',
    categoryTypeName: '', 
    superCategory: '', 
    category: '', 
    subCategory: '', 
    itemName: '',
    pickupDateTime: '',
    pickupLocation: '',
    pickupPoint: '',
    dropDateTime: '',
    dropLocation: '',
    dropPoint: '',
    customeName: '',
    countryDialCode: '',
    customerMobile: '',
    customerAlternateMobile: '',
    customerEmailId: '',
    totalDays: '',
    quantity: '',
    childrenQuantity: '',
    infantQuantity: '',
    vendorRate: '',
    payToVendor: '',
    companyRate: '',
    payToCompany: '',
    bookingAmount: '',
    balanceAmount: '',
    totalAmount: '',
    securityAmount: '',
    deliveryAmountToCompany: '',
    deliveryAmountToVendor: '',
    status: '',
    leadOrigine: '',
    leadType: '',
    createdBy: '',
    notes: '',
    followupDateTime: '',
    remarks: '',
    preValue: `    Reports : 
    Delivery : 
    Comments : 
    Pay to vendor : 
    Pay to company :`,
    reminderDate: '',
    records: '',
  };

  public isActivities:Boolean = false;

  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];
  filteredPickLocationList: any[] =[];
  filteredDropLocationList: any[] =[];

  constructor(
    private sidebar: SidebarService,
    private leadManagementService: LeadManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
    private cookiesService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    this.roleType = this.cookiesService.get('roleType');
    this.fullName =
      this.cookiesService.get('firstName') +
      ' ' +
      this.cookiesService.get('lastName');

      this.setDefaultDateTime();
  }

  setDefaultDateTime1(): void {
    const currentDate = new Date();

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

    this.selectedDateTime = `${year}-${month}-${day}T${hours}:${minutesFormatted}`;
  }

  setDefaultDateTime(): void {
    const currentDate = new Date();
  
    // Get the local date and time values
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');  // Months are zero-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  
    // Combine into the required format: YYYY-MM-DDTHH:MM
    // this.selectedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    this.lead.dropDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    this.lead.pickupDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit() {
    this.setDefaultDateTime();
    this.getCategoryType();
    this.getUserList();
    this.getPickLocation();
    this.getDropLocation();
    this.roleType === 'SUPERADMIN'
      ? (this.lead.createdBy = '')
      : (this.lead.createdBy = this.fullName);

      // if (this.filteredPickLocationList.length > 0) {
      //   this.lead.pickupLocation = this.filteredPickLocationList[0];
      // }
  }

  checkCategoryType(categoryType: any) {
    console.log(categoryType.categoryTypeName, Constant.ACTIVITY); // For debugging
    if (categoryType.categoryTypeName === Constant.ACTIVITY) {
      this.isActivities = true;
    } else {
      this.isActivities = false;
    }
  }

  onSelectionChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedOption = inputElement.value;
    console.log('Selected option:', this.selectedOption);
  }

  public routes = routes;
  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';
  public selectedValue4 = '';
  public selectedValue5 = '';
  public selectedValue6 = '';
  public selectedValue7 = '';
  public selectedValue8 = '';
  public selectedValue9 = '';
  public selectedValue10 = '';
  public selectedValue11 = '';

  selectedList1: data[] = [
    { id: 1, name: 'Car' },
    { id: 2, name: 'Bike' },
  ];

  selectedList2: data[] = [
    { id: 1, name: 'Car' },
    { id: 2, name: 'Bike' },
  ];

  selectedList3: data[] = [
    { id: 1, name: 'Car' },
    { id: 2, name: 'Bike' },
  ];

  // leadOrigine: listData[] = [{ value: 'CALL', name: 'Call'}, {value: 'WHATSAPP', name: 'Whats App'}, {value: 'EMAIL', name: 'Email'},{value: 'OTHER', name: 'Other'}];
  leadOrigine: listData[] = Constant.LEAD_ORIGINE_LIST;
  leadType: listData[] = Constant.LEAD_TYPE_LIST;
  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

  submitLeadForm(form: NgForm) {
    this.leadManagementService.saveLeadDetails(this.lead).subscribe({
      next: (response: any) => {
        alert("response : "+response.responseCode);
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            form.reset();
            this.setDefaultDateTime();
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

  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
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

  public getPickLocation() {
    this.categoriesManagementService.getLocationByType('PICK').subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.pickLocationList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.filteredPickLocationList = this.pickLocationList;
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

  public getDropLocation() {
    this.categoriesManagementService.getLocationByType('DROP').subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.dropLocationList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.filteredDropLocationList = this.dropLocationList;
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
    this.checkCategoryType(superCateId);
    const categoryId = superCateId?.id;
    this.categoriesManagementService
      .getSuperCategoryListByCategoryTypeId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(
              JSON.stringify(response.listPayload)
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

  public getUserList() {
    this.userManagementService.getUserDetailsList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.userList = JSON.parse(JSON.stringify(response.listPayload));
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
      case 'pickLocation':
        this.filteredPickLocationList = listVal;
        break;
        case 'dropLocation':
        this.filteredDropLocationList = listVal;
        break;
      default:
        break;
    }
  }
}
