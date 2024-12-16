import { Component, importProvidersFrom, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ReceiptHeaderListService } from '../../receipt-management/receipt-header-list/receipt-header-list.service';
import { ProgramManagementService } from '../../program-management/program-management.service';
import { CurrencyService } from '../../currency-management/currency/currency.service';
import { PaymentModeService } from '../../payment-mode-management/payment-mode/payment-mode.service';
import { UserManagementService } from '../../user-management/user-management.service';
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
import { DonationManagementService } from '../donation-management.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { Constant } from 'src/app/core/constant/constants';

interface data {
  value: string;
  name: string;
}

@Component({
  selector: 'app-all-donation-list',
  templateUrl: './all-donation-list.component.html',
  styleUrl: './all-donation-list.component.scss'
})
export class AllDonationListComponent {

  public editDonationForm!: FormGroup;
  public displayStyle = "none";
  public cancelDisplayStyle = "none"
  public selectedLoginId: string | null = null;
  public donationReceiptId: any;
  public userList: any

  public tabName: any;

  public loginUser: any;
  public isMainAdmin: boolean = false;
  public isSuperadmin: boolean = false;
  public isAdmin: boolean = false;
  public isTeamLeader: boolean = false;
  public isDonationExecutive: boolean = false;
  public teamLeaderList: any;

  public showCurrencyBox: boolean = false;
  public currencyList: any;
  public fundRisingOffcerList: any;
  public invoiceTypeList: any;
  public invoiceType: any;
  public paymentModeList: any;
  public donationTypeList: any;
  public programNames: string = '';
  public selectedProgramAmount: number | null = null;


  activeTab: string = 'TODAY';
  firstDate: any;
  lastDate: any


  // pagination variables
  public routes = routes;
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
    private fb: FormBuilder,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private receiptHeaderListService: ReceiptHeaderListService,
    private programManagementService: ProgramManagementService,
    private currencyService: CurrencyService,
    private paymentModeService: PaymentModeService,
    private donationManagementService: DonationManagementService,
    private userManagementService: UserManagementService,
    private dialog: MatDialog
  ) {

  }

  ngOnInit() {
    this.createForms();
    this.getUserList();
    this.getTeamleaderList();
    this.getDonationList('TODAY');
    this.getInvoiceTypeList();
    this.getDonationTypeList();
    this.getCurrencyDetailBySuperadmin();
    this.getPaymentModeList();
    this.getFundrisingOfficerByTeamLeaderId();
    this.checkRoleType();
  }


  createForms() {
    this.editDonationForm = this.fb.group({
      id: [''],
      invoiceHeaderDetailsId: [''],
      createdBy: [''],
      donorName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      mobileNumber: ['', Validators.pattern('^[0-9]*$')],
      emailId: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      address: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      panNumber: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      programName: [''],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      currency: [''],
      currencyCode: [''],
      transactionId: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      paymentMode: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      notes: ['']
    });
  }

  checkRoleType() {
    if (this.loginUser['roleType'] == Constant.mainAdmin) {
      this.isMainAdmin = true;
    } else if (this.loginUser['roleType'] == Constant.superAdmin) {
      this.isSuperadmin = true;
    } else if (this.loginUser['roleType'] == Constant.admin) {
      this.isAdmin = true;
    } else if (this.loginUser['roleType'] == Constant.teamLeader) {
      this.isTeamLeader = true;
    } else if (this.loginUser['roleType'] == Constant.donorExecutive) {
      this.isDonationExecutive = true;
    }
  }

  public getUserList() {
    this.userManagementService.getUserDetailsList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.userList = JSON.parse(JSON.stringify(response['listPayload']));
          } else {
          }
        },
        //   error: (error: any) => this.toastr.error('Server Error', '500'),
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


  getDonationListByUser(event: any): void {
    alert('Selected User ID:' + event.value); // Logs the selected user ID
    // Add your logic here
  }

  public getDonationList(tabName: string) {
    this.tabName = tabName;
    this.donationManagementService.getDonationList(tabName).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.allDonationList) {
          this.getTableData({ skip: res.skip, limit: this.totalData }, tabName);
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  private getTableData(pageOption: pageSelection, tabName: any): void {
    this.donationManagementService.getDonationList(tabName).subscribe((apiRes: any) => {
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


  openEditModal(templateRef: TemplateRef<any>, rowData: any) {
    this.editDonationForm.patchValue({
      id: rowData['id'],
      invoiceHeaderDetailsId: rowData['invoiceHeaderDetailsId'],
      invoiceHeaderName: rowData['invoiceHeaderName'],
      createdBy: rowData['createdBy'],
      donorName: rowData['donorName'],
      mobileNumber: rowData['mobileNumber'],
      emailId: rowData['emailId'],
      address: rowData['address'],
      panNumber: rowData['panNumber'],
      programName: rowData['programName'],
      amount: rowData['amount'],
      currency: rowData['currency'],
      currencyCode: rowData['currencyCode'],
      transactionId: rowData['transactionId'],
      paymentMode: rowData['paymentMode'],
      notes: rowData['notes'],
    });

    // this.dialog.open(templateRef);
    this.dialog.open(templateRef, {
      width: '1400px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });

  }

  public getInvoiceTypeList() {
    this.receiptHeaderListService.getInvoiceHeaderList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.invoiceTypeList = JSON.parse(JSON.stringify(response['listPayload']));
            // this.toastr.success(response['responseMessage'], response['responseCode']);
          } else {
            //this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  public getDonationTypeList() {
    this.programManagementService.getDonationTypeList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.donationTypeList = JSON.parse(JSON.stringify(response['listPayload']));
            this.programNames = this.donationTypeList.listPayload.map((item: any) => item.programName);

            // this.toastr.success(response['responseMessage'], response['responseCode']);
          } else {
            //  this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  onProgramSelect(program: any) {
    this.selectedProgramAmount = program['programAmount'];
  }

  public getCurrencyDetailBySuperadmin() {
    this.currencyService.getCurrencyDetailBySuperadmin()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.currencyList = JSON.parse(JSON.stringify(response['listPayload']));

            if (this.currencyList.length > 1) {
              this.showCurrencyBox = true;

            }
            this.editDonationForm.controls['currencyCode'].setValue(this.currencyList[0].currencyCode);
          } else {
          }
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  setCurrency(rawData: any) {
    const selectedCurrency = rawData['unicode'];
    console.log('Selected Currency:', rawData.currencyCode, selectedCurrency);
  }

  public getPaymentModeList() {
    this.paymentModeService.getPaymentModeList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.paymentModeList = JSON.parse(JSON.stringify(response['listPayload']));
          } else {
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  public getFundrisingOfficerByTeamLeaderId() {
    this.donationManagementService.getFundrisingOfficerByTeamLeaderId()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.fundRisingOffcerList = JSON.parse(JSON.stringify(response['listPayload']));
          } else {
            //this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  updateDonationDetails() {
    this.donationManagementService.updateDonationDetails(this.editDonationForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // console.log("ok hai")
              // this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.editDonationForm.reset();
              this.getDonationList(this.tabName);
              // this.setValueInForm();
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
      });
  }

}
