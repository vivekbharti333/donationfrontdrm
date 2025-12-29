import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Modal } from 'bootstrap';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { routes } from 'src/app/core/helpers/routes';
import { SidebarService } from 'src/app/core/service/sidebar/sidebar.service';
import { MessageService } from 'primeng/api';
import { PaymentGatewaySettingsService } from './payment-gateway-settings.service';

@Component({
  selector: 'app-payment-gateway-settings',
  templateUrl: './payment-gateway-settings.component.html',
  styleUrl: './payment-gateway-settings.component.scss',
  providers: [MessageService],
})
export class PaymentGatewaySettingsComponent {

  @ViewChild('editPgModal') editPgModalRef!: ElementRef;
  @ViewChild('addPgModel') addPgModalRef!: ElementRef;
  editPgModal!: Modal;
  addPgModel!: Modal;


  public addPgForm!: FormGroup;
  public editPgForm!: FormGroup;
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
    private messageService: MessageService,
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
    this.editPgForm = this.fb.group({
      pgProvider: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      redirectUrl: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      url: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      merchantId: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      saltIndex: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      saltKey: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],

    });
  }

  addPaymentGatewayDetails() {
    this.isLoading = true;
    this.paymentGatewayService.addUpdatePaymentGatewayDetails(this.addPgForm.value)
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

  editPaymentGatewayDetails() {
    this.isLoading = true;
    this.paymentGatewayService.addUpdatePaymentGatewayDetails(this.editPgForm.value)
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
            // this.pgDetailsList = this.pgDetailsList;

            // const rawValue = this.pgDetailsList['pgProvider'];
            // this.pgProvider = rawValue.charAt(0).toUpperCase() + rawValue.slice(1).toLowerCase();
            // this.setPgDetails();
            // this.pgDetailsList['serviceProvider'] = "NIMBUZ";

            // this.setEmailDetails();
          } else {
          }
        },
      });
  }

  ngAfterViewInit() {
    this.editPgModal = new Modal(this.editPgModalRef.nativeElement);
    this.addPgModel = new Modal(this.addPgModalRef.nativeElement);
  }
  addPaymentDetailsModal() {
    this.addPgForm.reset();
    this.addPgModel.show();
  }

  editPaymentDetailsModal(rowData: any) {
    this.editPgForm.patchValue({
      pgProvider: rowData['pgProvider'],
      redirectUrl: rowData['redirectUrl'],
      url: rowData['url'],
      merchantId: rowData['merchantId'],
      saltIndex: rowData['saltIndex'],
      saltKey: rowData['saltKey'],
    });
    this.pgProvider = rowData['pgProvider'];
    this.editPgModal.show();
  }

  // setPgDetails() {
  //   this.addPgForm.patchValue({
  //     pgProvider: this.pgDetailsList['pgProvider'],
  //     redirectUrl: this.pgDetailsList['redirectUrl'],
  //     url: this.pgDetailsList['url'],
  //     merchantId: this.pgDetailsList['merchantId'],
  //     saltIndex: this.pgDetailsList['saltIndex'],
  //     saltKey: this.pgDetailsList['saltKey'],
  //   });
  // }

  changeStatus(event: Event, data: any, index: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const requiredStatus = isChecked ? 'ACTIVE' : 'INACTIVE';

    this.paymentGatewayService.changePaymentGatewayStatus(requiredStatus, data)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getPaymentGatewayDetailsList();
              this.isLoading = false;
            } else {
              // show respMesg
            }
          } else {
            // show responseMessage
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),

      });
  }




}
