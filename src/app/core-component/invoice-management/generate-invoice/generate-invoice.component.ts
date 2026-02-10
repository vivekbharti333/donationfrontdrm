import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { GenerateInvoiceService } from './generate-invoice.service';
import { ToastModule } from 'primeng/toast';
import { ReceiptHeaderListService } from '../../receipt-management/receipt-header-list/receipt-header-list.service';

export interface Customer {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
}

export interface Company {
  id: number;
  invoiceInitial: string;
  serialNumber: string;
}


            

@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrl: './generate-invoice.component.scss',
  providers: [MessageService, ToastModule],
})
export class GenerateInvoiceComponent implements OnInit {

  invoiceForm!: FormGroup;

  customerList: any;
  invoiceHeaderList: any;

  companyFirstName!: string;
  companyLastName!: string;
  companyLastNameColor!: string;
  backgroundColor!: string;
  officeAddress!: string;
  regAddress!: string;
  mobileNo!: string;
  alternateMobile!: string;
  emailId!: string;
  website!: string;
  gstNumber!: string;
  panNumber!: string;


  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private invoiceService: GenerateInvoiceService
  ) { }

  ngOnInit(): void {
    this.createInvoiceForm();
    this.addItem(); // default one item
    this.getCustomerDetails();
    this.getInvoiceTypeList();
  }

  // ================= CREATE INVOICE FORM =================
  createInvoiceForm(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.invoiceForm = this.fb.group({

      // ===== SYSTEM =====
      superadminId: ['6202203047', Validators.required],
      companyId: [1, Validators.required],

      // ===== COMPANY =====
      companyLogo: [''],
      companyName: [''],
      officeAddress: [''],
      regAddress: [''],
      mobileNo: [''],
      emailId: [''],
      website: [''],
      gstNumber: [''],
      panNumber: [''],

      // ===== CUSTOMER =====
      customerName: ['', Validators.required],
      customerEmail: [''],
      customerPhone: [''],
      customerGstNumber: [''],
      billingAddress: [''],
      deliveryAddresses: [''],

      // ===== INVOICE =====
      // invoiceNumber: ['DFL-02/0104', Validators.required],
      invoiceNumber: ['', Validators.required],
      invoiceDate: [today, Validators.required],
      dueDate: [''],

      // ===== AMOUNTS (NEVER NULL) =====
      subtotal: [0, Validators.required],
      discount: [0],

      cgstRate: [0],
      cgstAmount: [0],

      sgstRate: [0],
      sgstAmount: [0],

      igstRate: [18],
      igstAmount: [0],

      totalAmount: [0, Validators.required],

      // ===== PAYMENT / STATUS =====
      status: ['ACTIVE'],
      paymentMode: ['ONLINE'],
      transactionId: [''],
      paymentStatus: ['UNPAID'],
      invoiceStatus: ['GENERATED'],

      // ===== AUDIT =====
      createdAt: [today],
      createdBy: ['6202203047'],

      // ===== ITEMS =====
      items: this.fb.array([])
    });
  }

  // ================= ITEMS ARRAY =================
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  // ================= ADD ITEM =================
  addItem(): void {
    this.items.push(
      this.fb.group({
        productName: ['', Validators.required],
        description: [''],
        rate: [0, [Validators.required, Validators.min(1)]],
        quantity: [1, [Validators.required, Validators.min(1)]],

        // IMPORTANT: do NOT disable (DB NOT NULL)
        amount: [0, Validators.required]
      })
    );
  }

  // ================= REMOVE ITEM =================
  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  // ================= CALCULATE TOTALS =================
  calculateTotals(): void {

    let subtotal = 0;

    this.items.controls.forEach(item => {
      const rate = Number(item.get('rate')?.value) || 0;
      const qty = Number(item.get('quantity')?.value) || 0;
      const amount = rate * qty;

      // 🔥 critical: ensure NOT NULL
      item.get('amount')?.setValue(amount);

      subtotal += amount;
    });

    const discount = Number(this.invoiceForm.get('discount')?.value) || 0;

    const cgstRate = Number(this.invoiceForm.get('cgstRate')?.value) || 0;
    const sgstRate = Number(this.invoiceForm.get('sgstRate')?.value) || 0;
    const igstRate = Number(this.invoiceForm.get('igstRate')?.value) || 0;

    const taxableAmount = subtotal - discount;

    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const igstAmount = (taxableAmount * igstRate) / 100;

    const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

    this.invoiceForm.patchValue({
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount
    });
  }

  // ================= GET INVOICE HEADER ===========
  public getInvoiceTypeList() {
    this.invoiceService.getInvoiceHeaderList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.invoiceHeaderList = JSON.parse(JSON.stringify(response['listPayload']));
            console.log(this.invoiceHeaderList)
            // this.toastr.success(response['responseMessage'], response['responseCode']);
          } else {
            //this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }


  onCompanyChange(event: Event) {
    const companyId = Number((event.target as HTMLSelectElement).value);

    const company = this.invoiceHeaderList.find(
      (c: Company) => c.id === companyId
    );

    if (!company) return;

    this.invoiceForm.patchValue({
      invoiceNumber: (company.invoiceInitial + company.serialNumber),

      companyLogo: company.companyLogo,
      companyName: company.companyName,
      officeAddress: company.officeAddress,
      regAddress: company.regAddress,
      mobileNo: company.mobileNo,
      emailId: company.emailId,
      website: company.website,
      gstNumber: company.gstNumber,
      panNumber: company.panNumber,
    });
  }

  // ================= GET CUSTOMER ==================
  public getCustomerDetails() {
    this.invoiceService.getCustomerDetails()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.customerList = JSON.parse(JSON.stringify(response['listPayload']));
            console.log(this.customerList)
          } else {
            //  this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  onCustomerChange(event: Event) {
  const customerId = Number((event.target as HTMLSelectElement).value);

  const customer = this.customerList.find(
    (c: Customer) => c.id === customerId
  );

  if (!customer) return;

  this.invoiceForm.patchValue({
    customerName: customer.customerName,
    email: customer.email,
    phone: customer.phone,
    gstNumber: customer.gstNumber,
    billingAddress: customer.billingAddress
  });
}

  // ================= SUBMIT INVOICE =================
  submitInvoice(): void {

    this.calculateTotals();

    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    const payload = this.invoiceForm.getRawValue();

    this.invoiceService.saveInvoiceDetails(payload)
      .subscribe({
        next: (response: any) => {

          console.log('API RESPONSE:', response);

          // ===== API LEVEL SUCCESS =====
          if (response?.responseCode === '200') {

            const respPayload = response.payload;

            // ===== BUSINESS SUCCESS =====
            if (respPayload?.respCode === '200') {
              const pdfUrl = `http://localhost/mycrm//download/invoice` + `?invoiceNumber=DFL-02/0104` + `&superadminId=1234567890`;

              window.open(pdfUrl, '_blank');

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: respPayload.respMesg || 'Invoice generated successfully'
              });

            } else {
              // ===== BUSINESS FAILURE =====
              this.messageService.add({
                severity: 'error',
                summary: respPayload?.respCode || 'Error',
                detail: respPayload?.respMesg || 'Operation failed'
              });
            }

          } else {
            // ===== API FAILURE =====
            this.messageService.add({
              severity: 'error',
              summary: response?.responseCode || 'Error',
              detail: response?.responseMessage || 'Request failed'
            });
          }
        },

        error: (err) => {
          console.error('SERVER ERROR:', err);
          this.messageService.add({
            severity: 'error',
            summary: '500',
            detail: 'Internal Server Error'
          });
        }
      });
  }


  // ================= RESET FORM =================
  resetForm(): void {
    this.invoiceForm.reset();
    this.items.clear();
    this.createInvoiceForm();
    this.addItem();
  }
}
