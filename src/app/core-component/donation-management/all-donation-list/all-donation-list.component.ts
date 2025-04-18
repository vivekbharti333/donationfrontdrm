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
import { DonationDetails, DonationListForExcel } from '../../interface/donation-management';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CustomPaginationComponent } from 'src/app/shared/custom-pagination/custom-pagination.component';

import * as fileSaver from 'file-saver';
import * as XLSX from 'xlsx-js-style'
// import * as XLSX from 'xlsx';
declare var $: any;
import { DatePipe } from '@angular/common';

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

  donationList: DonationListForExcel[] = []; // Use the defined interface
  datePipe = new DatePipe('en-US'); // Inject the DatePipe

  public fullData: DonationDetails[] = [];

  public donationUpdateDialog: any;
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
  public showExcelReport: boolean = false;
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

  public currentMonthName!: string;
  activeTab: string = 'TODAY';
  firstDate: any;
  lastDate: any

  POSTS: any;
  page: number = 1;
  count: number = 0;
  tableSize: number = 10;
  tableSizes: any = [3, 6, 9, 12];
  filteredDonations: any[] = []; // Filtered data
  searchTerm: string = '';


  // pagination variables
  public routes = routes;
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<DonationDetails>;
  public searchDataValue = '';
  //** / pagination variables


  public lastIndex = 0;
  // public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  // public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public totalPages = 0;


  constructor(
    private data: DataService,
    private pagination: PaginationService,
    // private customPaginationComponent: CustomPaginationComponent,
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
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
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

    const currentDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.currentMonthName = months[currentDate.getMonth()];
  }


  createForms() {
    this.editDonationForm = this.fb.group({
      id: [''],
      invoiceHeaderDetailsId: [''],
      invoiceHeaderName: [''],
      createdBy: [''],
      donorName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      mobileNumber: ['', Validators.pattern('^[0-9]*$')],
      emailId: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      address: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      panNumber: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      programName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      currency: [''],
      currencyCode: [''],
      transactionId: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      paymentMode: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      notes: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]]
    });
  }

  checkRoleType() {
    if (this.loginUser['roleType'] == Constant.mainAdmin) {
      this.isMainAdmin = true;
    } else if (this.loginUser['roleType'] == Constant.superAdmin) {
      this.isSuperadmin = true;
      this.isAdmin = true;
    } else if (this.loginUser['roleType'] == Constant.admin) {
      this.isAdmin = true;
      this.isSuperadmin = true;
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
    // alert('Selected User ID:' + event.value); // Logs the selected user ID
    // Add your logic here
  }

  // loadPagination(1: number): void {
  //   // Call the changePageSize method with the passed page size
  //   this.pagination.changePageSize(1);

  //   console.log(`Pagination initialized with page size: ${sk}`);
  // }



  downloadInvoice(receiptNo: string) {
    window.open(Constant.Site_Url + "donationinvoice/" + receiptNo, '_blank');
  }


  public getDonationList(tabName: string): void {
    // this.dataTableClear();
    this.tabName = tabName;
    this.serialNumberArray = [];

    this.donationManagementService.getDonationList(tabName).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.fullData = apiRes.listPayload; // Store the full dataset

      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.allDonationList) {
          this.pageSize = res.pageSize;

          // Use the full dataset for pagination
          this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  dataTableClear(){
    this.tableData = [];
    this.pageSize = 10;
    this.serialNumberArray= [];
    this.totalData = 0;
    this.showFilter = false;
    
  }
  
  getDonationListByDate(firstDate: any, lastDate: any): void {

    this.showExcelReport = false;
    this.donationList = [];
    this.firstDate = firstDate;
    this.lastDate = lastDate;
    this.serialNumberArray = [];


    this.donationManagementService.getDonationListByDate(firstDate, lastDate).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.fullData = apiRes.listPayload; // Store the full dataset

      // this.donationList = JSON.parse(JSON.stringify(apiRes['listPayload']));

      if(this.totalData >=1){
        this.showExcelReport = true;
      }

      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.allDonationList) {
          this.pageSize = res.pageSize;
          // Use the full dataset for pagination
          this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  private prepareTableData(apiRes: any[], pageOption: pageSelection): void {
    this.tableData = [];
    this.serialNumberArray = [];

    apiRes.forEach((res: DonationDetails, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        this.tableData.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    // Update the MatTableDataSource
    this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);
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
      const filteredData = this.fullData.filter((donation: DonationDetails) =>
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


    this.donationUpdateDialog = this.dialog.open(templateRef, {
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
          } else {

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

  updateDonationStatus(rawData:any) {
    this.donationManagementService.updateDonationStatus(rawData)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.editDonationForm.reset();
              this.getDonationList(this.tabName);
              this.donationUpdateDialog.close();

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
              summary: response['responseCode'],
              detail: response['responseMessage'],
              styleClass: 'danger-light-popover',
            });
          }
        },
      });
  }


  updateDonationDetails() {
    this.donationManagementService.updateDonationDetails(this.editDonationForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.editDonationForm.reset();
              this.getDonationList(this.tabName);
              this.donationUpdateDialog.close();

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
              summary: response['responseCode'],
              detail: response['responseMessage'],
              styleClass: 'danger-light-popover',
            });
          }
        },
      });
  }



  exportAsExcelFile(): void {
    let filteredArrayList: any[] = [];

    this.fullData.forEach((element: DonationDetails) => { // Explicitly type 'element'
      let createdAt = this.datePipe.transform(element.createdAt, 'dd-MM-yyyy');

      let data: any = {
        'Donor Name': element.donorName,
        'Mobile Number': element.mobileNumber,
        'Email ID': element.emailId,
        'Pan Number': element.panNumber,
        'Address': element.address,
        'Donation For': element.programName,
        'Currency': element.currencyCode,
        'Amount': element.amount,
        'Transaction ID': element.transactionId,
        'Payment Mode': element.paymentMode,
        'Receipt': element.receiptNumber,
        'Invoice Number': element.invoiceNumber,
        'Received By': element.createdbyName,
        'Team Leader ID': element.teamLeaderId,
        'Invoice For': element.invoiceHeaderName,
        'Super Admin ID': element.superadminId,
        'Donation Date': createdAt,
      };

      filteredArrayList.push(data);
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredArrayList);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const blob: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    fileSaver.saveAs(blob, 'Donation Report.xlsx');
  }

}
