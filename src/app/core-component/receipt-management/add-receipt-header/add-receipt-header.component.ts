import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ReceiptManagementService } from '../receipt-management.service';
import { UserManagementService } from '../../user-management/user-management.service';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Editor, Toolbar } from 'ngx-editor';


@Component({
  selector: 'app-add-receipt-header',
  templateUrl: './add-receipt-header.component.html',
  styleUrl: './add-receipt-header.component.scss',
  providers: [MessageService, ToastModule, CalendarModule],
})
export class AddReceiptHeaderComponent implements OnInit, OnDestroy {

  public superadminForm!: FormGroup;
  public addInvoiceHeaderForm!: FormGroup;
  public loading = false;
  public superadminList: any;
  public invoiceHeaderList: any;
  public isInvoiceHeaderExists = false;
  public isSuperadmin = false;

  public superadminId: any;
    public loginUser : any;

  public logo: any;

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService,
    private receiptManagementService: ReceiptManagementService,
    private messageService: MessageService,
        private authenticationService: AuthenticationService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  checkRoleType(): void {
    this.isSuperadmin = this.loginUser?.roleType === Constant.superAdmin;
  }
  

  ngOnInit() {
    this.createForms();
    this.checkRoleType();
    this.editor = new Editor();
    this.superadminId = this.loginUser?.superadminId || this.loginUser?.loginId;

    if (!this.isSuperadmin) {
      this.getSuperadminList();
    }
    if (this.superadminId) {
      this.getInvoiceHeaderList(String(this.superadminId), 'BYSUPERADMINID');
    }
  }

   editor!: Editor;
    toolbar: Toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      ['code', 'blockquote'],
      ['ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['link', 'image'],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];
  
    
  
    ngOnDestroy(): void {
      this.editor.destroy();
    }
    // showBox = false;
    // toggleBox() {
    //   this.showBox = !this.showBox;
    // }


  createForms() {
    this.superadminForm = this.fb.group({
      id: [''],
      superadminId: [''],
    });
    this.addInvoiceHeaderForm = this.fb.group({
      id: [''],
      invoiceInitial: ['', Validators.required],
      companyLogo: [''],
      companyFirstName: ['', Validators.required],
      companyFirstNameColor: [''],
      companyLastName: [''],
      companyLastNameColor: [''],
      backgroundColor: [''],
      address: [''],
      officeAddress: [''],
      regAddress: [''],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      alternateMobile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      emailId: ['', [Validators.required, Validators.email]],
      website: ['', Validators.required],
      gstNumber: ['', Validators.required],
      panNumber: ['', Validators.required],
      invoiceEmail: [''],
	    invoiceSms: [''],
	    invoiceWhatsApp: [''],
      accountHolderName: [''],
      accountNumber: [''],
      ifscCode: [''],
      bankName: [''],
      branchName: [''],
      footer: [''],
      thankYouNote: [''],
      createdBy: [''],
      superadminId: [''],
    });
  }


  getInvoiceHeaderList(selectedValue: string, requestFor: string): void {
    this.superadminId = selectedValue;
    this.loading = true;
    this.receiptManagementService.getInvoiceHeaderBySuperadminId(this.superadminId, "", requestFor)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (Number(response?.responseCode) === 200) {
            this.invoiceHeaderList = response?.listPayload || [];
            if (this.invoiceHeaderList.length) {
              this.getAndSetInvoiceHeaderDetails();
            } else {
              this.isInvoiceHeaderExists = false;
              this.addInvoiceHeaderForm.reset();
            }
          } else {
            this.showError(response?.responseMessage || 'Unable to load receipt headers.');
          }
        },
        error: () => {
          this.loading = false;
          this.showError('Unable to load receipt headers.');
        },
      });
  }

  public getInvoiceHeaderById(id:any, requestFor: any) {
  // public getInvoiceHeaderById(event: Event, requestFor: any) {
    // const id = (event.target as HTMLSelectElement).value;
    const str = id;

    // const splitValues = str.split(':'); // Split the string by colon
    this.receiptManagementService.getInvoiceHeaderBySuperadminId(this.superadminId, id, "BYID")
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.invoiceHeaderList = JSON.parse(JSON.stringify(response['listPayload']));
            this.getAndSetInvoiceHeaderDetails();

            // this.getInvoiceHeaderList(this.superadminId, "BYSUPERADMINID")
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  public getSuperadminList() {
    this.userManagementService.getUserDetailsList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superadminList = JSON.parse(JSON.stringify(response['listPayload']));
            this.superadminList = this.superadminList;
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }


  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part

        // Set the base64 string to the userPicture field
        this.addInvoiceHeaderForm.patchValue({
          companyLogo: base64String
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  getAndSetInvoiceHeaderDetails() {
    const header = this.invoiceHeaderList?.[0];
    if (!header) {
      this.isInvoiceHeaderExists = false;
      return;
    }

    if (header['gstNumber'] != null) {
      this.isInvoiceHeaderExists = true;
    }
    this.addInvoiceHeaderForm.patchValue(header);
    this.logo = header['companyLogo'] ? 'data:image/png;base64,' + header['companyLogo'] : null;
  }


  saveInvoiceHeader() {
    // if (this.addInvoiceHeaderForm.invalid) {
    //   this.addInvoiceHeaderForm.markAllAsTouched();
    //   this.showError('Please complete all required fields with valid information.');
    //   return;
    // }

    this.loading = true;
    this.receiptManagementService.saveInvoiceHeader(this.superadminId, this.addInvoiceHeaderForm.value)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
         if (Number(response?.responseCode) === 200) {
            if (Number(response?.payload?.respCode) === 200) {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });
              // this.getInvoiceHeaderList();
            } else {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-light-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-light-popover',
            });
          }
        },
        error: () => {
          this.loading = false;
          this.showError('The receipt header could not be saved. Please try again.');
        }
      });
  }

  private showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Unable to continue', detail });
  }

}
