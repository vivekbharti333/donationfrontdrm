import { Component } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ReceiptManagementService } from '../receipt-management.service';
import { UserManagementService } from '../../user-management/user-management.service';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';

import { Editor, Toolbar } from 'ngx-editor';


@Component({
  selector: 'app-add-receipt-header',
  templateUrl: './add-receipt-header.component.html',
  styleUrl: './add-receipt-header.component.scss',
  providers: [MessageService, ToastModule, CalendarModule],
})
export class AddReceiptHeaderComponent {

  public superadminForm!: FormGroup;
  public addInvoiceHeaderForm!: FormGroup;
  public loading: Boolean = false;
  public superadminList: any;
  public invoiceHeaderList: any;
  public isInvoiceHeaderExists: Boolean = false;

  public superadminId: any;

  public logo: any;

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService,
    private receiptManagementService: ReceiptManagementService,
    private messageService: MessageService,
  ) {
  }

  ngOnInit() {
    this.createForms();
    this.getSuperadminList();
    this.editor = new Editor();
    // this.getInvoiceHeaderList();
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
      invoiceInitial: [''],
      companyLogo: [''],
      companyFirstName: [''],
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
      website: [''],
      gstNumber: [''],
      panNumber: [''],
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
    this.receiptManagementService.getInvoiceHeaderBySuperadminId(this.superadminId, "", requestFor)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.invoiceHeaderList = JSON.parse(JSON.stringify(response['listPayload']));
            this.getAndSetInvoiceHeaderDetails();
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
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

    if (this.invoiceHeaderList[0]['gstNumber'] != null) {
      this.isInvoiceHeaderExists = true;
    }
    this.invoiceHeaderList[0]['gstNumber'],

      this.addInvoiceHeaderForm.patchValue({
        invoiceInitial: this.invoiceHeaderList[0]['invoiceInitial'],
        companyFirstName: this.invoiceHeaderList[0]['companyFirstName'],
        companyFirstNameColor: this.invoiceHeaderList[0]['companyFirstNameColor'],
        companyLastName: this.invoiceHeaderList[0]['companyLastName'],
        companyLastNameColor: this.invoiceHeaderList[0]['companyLastNameColor'],
        backgroundColor: this.invoiceHeaderList[0]['backgroundColor'],
        officeAddress: this.invoiceHeaderList[0]['officeAddress'],
        regAddress: this.invoiceHeaderList[0]['regAddress'],
        mobileNo: this.invoiceHeaderList[0]['mobileNo'],
        alternateMobile: this.invoiceHeaderList[0]['alternateMobile'],
        emailId: this.invoiceHeaderList[0]['emailId'],
        website: this.invoiceHeaderList[0]['website'],
        gstNumber: this.invoiceHeaderList[0]['gstNumber'],
        panNumber: this.invoiceHeaderList[0]['panNumber'],
        accountHolderName: this.invoiceHeaderList[0]['accountHolderName'],
        accountNumber: this.invoiceHeaderList[0]['accountNumber'],
        ifscCode: this.invoiceHeaderList[0]['ifscCode'],
        bankName: this.invoiceHeaderList[0]['bankName'],
        branchName: this.invoiceHeaderList[0]['branchName'],
        thankYouNote: this.invoiceHeaderList[0]['thankYouNote'],
        footer: this.invoiceHeaderList[0]['footer'],
        companyLogo: this.invoiceHeaderList[0]['companyLogo'],

        // createdBy: this.invoiceHeaderList[0]['createdBy'],
        // superadminId: this.invoiceHeaderList.superadminId,
      });
    this.logo = 'data:image/png;base64,' + this.invoiceHeaderList[0]['companyLogo'];
  }


  saveInvoiceHeader() {
    this.receiptManagementService.saveInvoiceHeader(this.superadminId, this.addInvoiceHeaderForm.value)
      .subscribe({
        next: (response: any) => {

          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
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
        error: (error: any) => this.messageService.add({
          summary: "Server error",
          detail: "500",
          styleClass: 'danger-light-popover',
        })
      });
  }

}
