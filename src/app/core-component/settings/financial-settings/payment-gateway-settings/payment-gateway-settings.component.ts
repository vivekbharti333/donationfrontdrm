import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Modal } from 'bootstrap';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { routes } from 'src/app/core/helpers/routes';
import { SidebarService } from 'src/app/core/service/sidebar/sidebar.service';
import { PaymentGatewaySettingsService } from './payment-gateway-settings.service';

@Component({
  selector: 'app-payment-gateway-settings',
  templateUrl: './payment-gateway-settings.component.html',
  styleUrl: './payment-gateway-settings.component.scss',
})
export class PaymentGatewaySettingsComponent {

  @ViewChild('paymentModal') paymentModalRef!: ElementRef;
  modalInstance!: Modal;

  public addPgForm!: FormGroup;
  public isLoading = false;
  public loginUser: any;
  public pgDetailsList: any;
  public pgProvider: any;

  public routes = routes;
  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  constructor(
    private sidebar: SidebarService,
    private fb: FormBuilder,
    private paymentGatewayService: PaymentGatewaySettingsService
  ) { }

  ngOnInit() {
    this.createForms();
    this.getPaymentGatewayDetailsList();
  }

  emailTypeOption: any = ['DONATION_RECEIPT'];


  createForms() {
    this.addPgForm = this.fb.group({
      pgProvider: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      redirectUrl: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      url: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      merchantId: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      saltIndex: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      saltKey: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      
    });
  }

  addPaymentGatewayDetails(){
    this.isLoading = true;
    this.paymentGatewayService.addPaymentGatewayDetails(this.addPgForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.addPgForm.reset();
              this.isLoading = false;
            } else {
              
            }
          } else {
           
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),

      });
  }


  public getPaymentGatewayDetailsList() {
    this.paymentGatewayService.getPaymentGatewayDetailsList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.pgDetailsList = JSON.parse(JSON.stringify(response['listPayload']));
            this.pgDetailsList = this.pgDetailsList;

            const rawValue = this.pgDetailsList['pgProvider'];
            this.pgProvider = rawValue.charAt(0).toUpperCase() + rawValue.slice(1).toLowerCase();
            this.setPgDetails();
            // this.pgDetailsList['serviceProvider'] = "NIMBUZ";

            // this.setEmailDetails();
          } else {
          }
        },
      });
  }

  ngAfterViewInit() {
    this.modalInstance = new Modal(this.paymentModalRef.nativeElement);
  }

  openModal(rowData:any) {
    this.modalInstance.show();
  }

  setPgDetails() {
    this.addPgForm.patchValue({
      pgProvider: this.pgDetailsList['pgProvider'],
      redirectUrl: this.pgDetailsList['redirectUrl'],
      url: this.pgDetailsList['url'],
      merchantId: this.pgDetailsList['merchantId'],
      saltIndex: this.pgDetailsList['saltIndex'],
      saltKey: this.pgDetailsList['saltKey'],
    });
  }

}
