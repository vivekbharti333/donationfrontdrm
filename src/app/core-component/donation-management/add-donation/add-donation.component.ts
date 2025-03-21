import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReceiptHeaderListService } from '../../receipt-management/receipt-header-list/receipt-header-list.service';
import { ProgramManagementService } from '../../program-management/program-management.service';
import { CurrencyService } from '../../currency-management/currency/currency.service';
import { PaymentModeService } from '../../payment-mode-management/payment-mode/payment-mode.service';
import { DonationManagementService } from '../donation-management.service';
// import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { MatSelectChange } from '@angular/material/select';


interface DonationProgram {
  id: string;
  programName: string;
  programAmount: string;
}

interface CurrencyDetails {
  id: string,
  country: string;
  currencyName: string;
  currencyCode: string;
  unicode: string;
            
}

@Component({
  selector: 'app-add-donation',
  templateUrl: './add-donation.component.html',
  styleUrls: ['./add-donation.component.scss'],
})
export class AddDonationComponent {
  public addDonationForm!: FormGroup;
  public isLoading = false;
  public loginUser : any;
  public showFundrisingOfficerList: boolean = false;

  public showCurrencyBox: boolean = false;
  public currencyList: any;
  public fundRisingOffcerList: any;
  public invoiceTypeList: any;
  public invoiceType: any;
  public paymentModeList: any;
  public donationTypeList: any;
  public donationTypeAmount: any;
  public programNames: string = '';
  public selectedProgramAmount: number | null = null;

  public selectedProgramId: any;
  public selectedCurrencyId: any;
  public selectedCurrencyCode: any;


  ngOnInit() {
    this.createForms();
    this.getInvoiceTypeList();
    this.getDonationTypeList();
    this.getCurrencyDetailBySuperadmin();
    this.getPaymentModeList();
    this.getFundrisingOfficerByTeamLeaderId();
    this.checkRoleType();
    this.getDonationTypeAmount("","");
  }

  constructor(
    private fb: FormBuilder,
    // private http: HttpClient,
    private router: Router,
    private receiptHeaderListService: ReceiptHeaderListService,
    private programManagementService: ProgramManagementService,
    private currencyService: CurrencyService,
    private paymentModeService: PaymentModeService,
    private donationManagementService: DonationManagementService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    this.createForms();
  }

  checkRoleType(){
    if(this.loginUser['roleType'] == Constant.mainAdmin ||
       this.loginUser['roleType'] == Constant.superAdmin ||
       this.loginUser['roleType'] == Constant.admin 
      // ||
      // this.loginUser['roleType'] == Constant.teamLeader
    ){
      this.showFundrisingOfficerList = true;
    } else if(this.loginUser['roleType'] == Constant.fundraisingOfficer){
      this.showFundrisingOfficerList = false;
    }
  }

  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Donation added successfully!' });
  }

  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred during donation!' });
  }

  createForms() {
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

  getAmountValueByIds(selectedProgramName: string, selectCurrencyName: string) {
    // console.log(`Selected Program Name: ${selectedProgramName}`);
    // console.log(`Selected Currency Name: ${selectCurrencyName}`);

    // Find the selected program by name and get its ID
    const selectedProgram = this.donationTypeList.find((p: DonationProgram) => p.programName === selectedProgramName);
    if (selectedProgram) {
      this.selectedProgramId = selectedProgram.id;
      console.log("Selected Program ID: " + selectedProgram.id);
    }

    // Find the selected program by name and get its ID
    const selectedCurrency = this.currencyList.find((c: CurrencyDetails) => c.currencyCode === selectCurrencyName);

    if (selectedCurrency) {
      this.selectedCurrencyId = selectedCurrency.id;
      console.log("Selected Program ID: " + selectedCurrency.id);
    }

    this.selectedCurrencyCode = selectCurrencyName;

    if(this.selectedProgramId && this.selectedCurrencyId){

      // this.getDonationTypeAmount(this.selectedProgramId, this.selectedCurrencyId);

      this.getDonationTypeAmount(this.selectedProgramId, this.selectedCurrencyCode);
    }

  }

  public getDonationTypeAmount(programId: any, currencyMasterId: any) {
    this.programManagementService.getDonationTypeAmount(programId,currencyMasterId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.donationTypeAmount = JSON.parse(JSON.stringify(response['listPayload']));

            this.addDonationForm.patchValue({amount: this.donationTypeAmount[0]['programAmount']})

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
            if(!this.showCurrencyBox){
              this.addDonationForm.controls['currencyCode'].setValue(this.currencyList[0].currencyCode);
            }
            
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

  public saveDonationDetails() {
    this.isLoading = true;
    this.donationManagementService.saveDonationDetails(this.addDonationForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {
              console.log("ok hai")
              //this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });

              // this.messageService.add({
              //   summary: 'Toast',
              //   detail: 'Your,toast message here.',
              //   styleClass: 'success-light-popover',
              // });

              this.addDonationForm.reset();
              this.addDonationForm.controls['currencyCode'].setValue(this.currencyList[0].currencyCode);
              // this.setValueInForm();
              // this.isLoading = false;

              if (payload['paymentMode'] == 'PAYMENT_GATEWAY') {
                let url = payload['paymentGatewayPageRedirectUrl'];
                this.router.navigate(['donation/donationlist']);
                window.open(url, '_blank');
              }

            } else {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-light-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['responseCode'],
              detail: response['responseMessage'],
              styleClass: 'danger-light-popover',
            });
          }

          // this.messageService.add({
          //   summary: 'Toast',
          //   detail: 'Your,toast message here.',
          //   styleClass: 'danger-light-popover',
          // });
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }
}