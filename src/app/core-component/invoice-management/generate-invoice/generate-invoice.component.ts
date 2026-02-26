import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { GenerateInvoiceService } from './generate-invoice.service';
import { ToastModule } from 'primeng/toast';


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

export interface Product {
  id: number;
  productName: string;
  description: string;
  rate: number;
  quantityType: string;
  quantity: number;
  createdAt: number;
  createdBy: string;
  superadminId: string;
}

@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.scss'],
  providers: [MessageService]
})
export class GenerateInvoiceComponent implements OnInit {

  invoiceForm!: FormGroup;
  customerList: any;
  invoiceHeaderList: any;
  productList: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private invoiceService: GenerateInvoiceService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.addItem();
    this.getCustomerDetails();
    this.getInvoiceTypeList();
    this.getProducttList();

  }

  createForm(): void {

    const today = new Date().toISOString().substring(0, 10);

    this.invoiceForm = this.fb.group({

      // ===== COMPANY =====
      companyId: [''],
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

      invoiceNumber: ['INV-001', Validators.required],
      invoiceDate: [today],
      dueDate: [today],

      subtotal: [0],
      discount: [0],
      taxAmount: [0],
      totalAmount: [0],

      status: ['ACTIVE'],
      paymentMode: ['ONLINE'],
      transactionId: [''],
      paymentStatus: ['UNPAID'],
      invoiceStatus: ['GENERATED'],

      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        productName: ['', Validators.required],
        description: [''],
        rate: [0, Validators.required],
        quantity: [1, Validators.required],
        taxType: [''],

        // 🔹 ADD THESE
        igstRate: [0],
        cgstRate: [0],
        sgstRate: [0],

        cgstAmount: [0],
        sgstAmount: [0],
        igstAmount: [0],
        taxAmount: [0],   // 👈 IMPORTANT

        amount: [0]
      })
    );
  }


  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  onTaxTypeChange(index: number): void {

  const item = this.items.at(index) as FormGroup;
  const taxType = item.get('taxType')?.value;

  if (taxType === 'IGST') {
    item.patchValue({ cgstRate: 0, sgstRate: 0 });
  }

  if (taxType === 'CGST_SGST') {
    item.patchValue({ igstRate: 0 });
  }

  this.calculateTotals();
}

calculateTotals(): void {

  let subtotal = 0;
  let totalTax = 0;

  const discount = +this.invoiceForm.get('discount')?.value || 0;

  this.items.controls.forEach(control => {

    const item = control as FormGroup;

    const rate = +item.get('rate')?.value || 0;
    const qty = +item.get('quantity')?.value || 0;
    const taxType = item.get('taxType')?.value;

    const base = rate * qty;
    subtotal += base;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const igstRate = +item.get('igstRate')?.value || 0;
    const cgstRate = +item.get('cgstRate')?.value || 0;
    const sgstRate = +item.get('sgstRate')?.value || 0;

    if (taxType === 'IGST') {
      igst = base * igstRate / 100;
    }

    if (taxType === 'CGST_SGST') {
      cgst = base * cgstRate / 100;
      sgst = base * sgstRate / 100;
    }

    const rowTax = cgst + sgst + igst;
    totalTax += rowTax;

    item.patchValue({
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      taxAmount: rowTax,
      amount: base + rowTax
    }, { emitEvent: false });

  });

  const grandTotal = subtotal + totalTax;

  // 🔥 Your Required Formula
  const finalTotal = grandTotal - discount;

  this.invoiceForm.patchValue({
    subtotal: subtotal,
    taxAmount: totalTax,
    totalAmount: finalTotal
  }, { emitEvent: false });

}

  syncDeliveryAddress(event: any): void {

    if (event.target.checked) {
      const billing = this.invoiceForm.get('billingAddress')?.value;
      this.invoiceForm.patchValue({
        deliveryAddresses: billing
      });
    } else {
      this.invoiceForm.patchValue({
        deliveryAddresses: ''
      });
    }
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

  public getProducttList() {
    this.invoiceService.getProductList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.productList = JSON.parse(JSON.stringify(response['listPayload']));
            console.log(this.productList)
            // this.toastr.success(response['responseMessage'], response['responseCode']);
          } else {
            //this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  /** 🔁 Reusable logic */
  onProductSelect(event: Event, index: number): void {
    const productName = (event.target as HTMLSelectElement).value;
    this.updateDescription(productName, index);
  }



  updateDescription(productName: string, index: number): void {

    const product = this.productList.find(
      p => p.productName === productName
    );

    console.log('Matched product:', product);

    const itemsArray = this.invoiceForm.get('items') as FormArray;
    const rowGroup = itemsArray.at(index) as FormGroup;

    rowGroup.patchValue({
      description: product?.description ?? ''
    });

    console.log(
      'Row description:',
      rowGroup.get('description')?.value
    );
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
      companyId: company.id,
      companyName: company.companyFirstName + ' ' + company.companyLastName,
      officeAddress: company.officeAddress,
      regAddress: company.regAddress,
      mobileNo: company.mobileNo,
      emailId: company.emailId,
      website: company.website,
      gstNumber: company.gstNumber,
      panNumber: company.panNumber,
    });
  }

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
    console.log(this.invoiceForm.getRawValue().value)
    this.invoiceService.saveInvoiceDetails(payload)
      .subscribe({
        next: (response: any) => {

          console.log('API RESPONSE:', response);

          // ===== API LEVEL SUCCESS =====
          if (response?.responseCode === '200') {

            const respPayload = response.payload;

            // ===== BUSINESS SUCCESS =====
            if (respPayload?.respCode === '200') {
              // const pdfUrl = `http://localhost/mycrm//download/invoice?invoiceNumber='+this.invoiceForm['invoiceNumber']+'&superadminId=8800689752`;
              // window.open(pdfUrl, '_blank');

              const { invoiceNumber } = this.invoiceForm.getRawValue();

              const url = `http://localhost/mycrm/download/invoice?invoiceNumber=${encodeURIComponent(invoiceNumber)}&superadminId=8800689752`;
              window.open(url, '_blank');

              console.log(url)

               this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });
              // this.messageService.add({
              //   severity: 'success',
              //   summary: 'Success',
              //   detail: respPayload.respCode || respPayload.respMesg
              // });

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


  // http://localhost:4200/#/invoice-management/generate-invoice


}
