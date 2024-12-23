import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SidebarService, routes } from 'src/app/core/core.index'; // Ensure correct import path
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { LeadManagementService } from '../../lead-management.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReceiptHeaderListService } from 'src/app/core-component/receipt-management/receipt-header-list/receipt-header-list.service';
import { ProgramManagementService } from 'src/app/core-component/program-management/program-management.service';
import { CurrencyService } from 'src/app/core-component/currency-management/currency/currency.service';
import { PaymentModeService } from 'src/app/core-component/payment-mode-management/payment-mode/payment-mode.service';
import { DonationManagementService } from 'src/app/core-component/donation-management/donation-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';
import { SpinnerService } from 'src/app/core/core.index';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { CalendarModule } from 'primeng/calendar';

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

  public selectedOption: string = 'lead';
  public addDonationForm!: FormGroup;
  public leadForm!: FormGroup;
  public isLoading = false;
  public loginUser: any;
  public userList: any
  public showFundrisingOfficerList: boolean = false;
  public showFollowupDateBox: boolean =false;

  public donationList: any;
  public showCurrencyBox: boolean = false;
  public currencyList: any;
  public fundRisingOffcerList: any;
  public invoiceTypeList: any;
  public invoiceType: any;
  public paymentModeList: any;
  public donationTypeList: any;
  public programNames: string = '';
  public selectedProgramAmount: number | null = null;

  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private sidebar: SidebarService,

    private leadManagementService: LeadManagementService,
    private authenticationService: AuthenticationService,
    private spinnerService: SpinnerService,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
    private cookiesService: CookieService,
    private receiptHeaderListService: ReceiptHeaderListService,
    private programManagementService: ProgramManagementService,
    private currencyService: CurrencyService,
    private paymentModeService: PaymentModeService,
    private donationManagementService: DonationManagementService,
    private messageService: MessageService,
  ) {

  }

  ngOnInit() {
    this.getUserList();
    this.getDonationListForLead('JH');
    this.createForms();
    this.getInvoiceTypeList();
    this.getDonationTypeList();
    this.getCurrencyDetailBySuperadmin();
    this.getPaymentModeList();
    this.getFundrisingOfficerByTeamLeaderId();
  }

  createForms() {
    this.leadForm = this.fb.group({
      id: [''],
      donorName: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')]],
      mobileNumber: ['', [Validators.pattern('^[0-9]{10}$')]], // Assuming a 10-digit phone number
      programName: [''],
      emailId: ['', [Validators.required, Validators.email]],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      currency: ['', [Validators.required]],
      status: ['', [Validators.required]],
      followupDate: [''],
      notes: [''],
    });

    this.addDonationForm = this.fb.group({
      createdBy: ['N/A'],
      invoiceHeaderDetailsId: [''],
      donorName: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')]],
      mobileNumber: ['', [Validators.pattern('^[0-9]{10}$')]], // Assuming a 10-digit phone number
      emailId: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.pattern('[A-Za-z0-9 ,.-]{3,150}')]],
      panNumber: ['', [Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      programName: [''],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      currency: ['', [Validators.required]],
      currencyCode: ['', [Validators.required]],
      transactionId: ['', [Validators.pattern('[A-Za-z0-9]{3,150}')]],
      paymentMode: ['', [Validators.required]],
      notes: [''],
    });
  }

  checkStatus(status: any){
    this.showFollowupDateBox = false;
    if( status.value == "FOLLOWUP"){
      this.showFollowupDateBox = true;
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

  public getDonationListForLead(event: any) {

    this.donationManagementService.getDonationListForLead(event.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.donationList = JSON.parse(JSON.stringify(response['listPayload']));

            this.donationList = this.donationList[0];
            this.setDonationDetailsToLeadForm();
            this.setDonationDetailsToNewDonationForm();

            // this.toastr.success(response['responseMessage'], response['responseCode']);
          } else {
            //  this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  setDonationDetailsToLeadForm() {
    this.leadForm.patchValue({
      id: this.donationList['id'],
      donorName: this.donationList['donorName'],
      mobileNumber: this.donationList['mobileNumber'],
      emailId: this.donationList['emailId'],
      programName: this.donationList['programName'],
      amount: this.donationList['amount'],
      currency: this.donationList['currency'],
      // notes: this.donationList['notes'],
    });
  }

  setDonationDetailsToNewDonationForm() {
    this.addDonationForm.patchValue({
      id: this.donationList['id'],
      invoiceHeaderDetailsId: this.donationList['invoiceHeaderDetailsId'],
      invoiceHeaderName: this.donationList['invoiceHeaderName'],
      createdBy: this.donationList['createdBy'],
      donorName: this.donationList['donorName'],
      mobileNumber: this.donationList['mobileNumber'],
      emailId: this.donationList['emailId'],
      address: this.donationList['address'],
      panNumber: this.donationList['panNumber'],
      programName: this.donationList['programName'],
      amount: this.donationList['amount'],
      currency: this.donationList['currency'],
      currencyCode: this.donationList['currencyCode'],
      transactionId: this.donationList['transactionId'],
      paymentMode: this.donationList['paymentMode'],
      notes: this.donationList['notes'],
    });
  }

  onSelectionChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedOption = inputElement.value;
    console.log('Selected option:', this.selectedOption);
  }

  public getInvoiceTypeList() {
    this.receiptHeaderListService.getInvoiceHeaderList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.invoiceTypeList = JSON.parse(JSON.stringify(response['listPayload']));
            console.log(this.invoiceTypeList)
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

            console.log("This one :" + this.donationTypeList.value)
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
            this.addDonationForm.controls['currencyCode'].setValue(this.currencyList[0].currencyCode);
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

  saveLeadDetails() {
    this.donationManagementService.saveLeadDetails(this.leadForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {

              this.getDonationListForLead("hk");

              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });
              this.addDonationForm.reset();
              this.leadForm.reset();
              // this.addDonationForm.controls['currencyCode'].setValue(this.currencyList[0].currencyCode);

              // if (payload['paymentMode'] == 'PAYMENT_GATEWAY') {
              //   let url = payload['paymentGatewayPageRedirectUrl'];
              //   console.log(" URL : " + url)
              //   this.router.navigate(['donation/donationlist']);
              //   window.open(url, '_blank');
              // }

            } else {
              this.messageService.add({ severity: 'danger', summary: 'Failed', detail: response['payload']['respMesg'] });
            }
          } else {
          }
        },

      });
  }

  public saveDonationDetails() {

    this.donationManagementService.saveDonationDetails(this.addDonationForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {


              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });
              this.addDonationForm.reset();
              this.addDonationForm.controls['currencyCode'].setValue(this.currencyList[0].currencyCode);

              if (payload['paymentMode'] == 'PAYMENT_GATEWAY') {
                let url = payload['paymentGatewayPageRedirectUrl'];
                console.log(" URL : " + url)
                this.router.navigate(['donation/donationlist']);
                window.open(url, '_blank');
              }

            } else {


            }
          } else {


          }
        },

      });
  }



}
