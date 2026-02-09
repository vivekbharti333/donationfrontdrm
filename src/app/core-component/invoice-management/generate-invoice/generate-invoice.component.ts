import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { GenerateInvoiceService } from './generate-invoice.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrl: './generate-invoice.component.scss',
  providers: [MessageService, ToastModule], 
})
export class GenerateInvoiceComponent implements OnInit {

  invoiceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private invoiceService: GenerateInvoiceService
  ) {}

  ngOnInit(): void {
    this.createInvoiceForm();
    this.addItem(); // default one item
  }

  // ================= CREATE INVOICE FORM =================
  createInvoiceForm(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.invoiceForm = this.fb.group({

      // ===== SYSTEM =====
      superadminId: ['6202203047', Validators.required],
      companyId: [1, Validators.required],

      // ===== CUSTOMER =====
      customerName: ['', Validators.required],
      email: [''],
      phone: [''],
      gstNumber: [''],
      billingAddress: [''],
      deliveryAddresses: [''],

      // ===== INVOICE =====
      invoiceNumber: ['DFL-02/0104', Validators.required],
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
const pdfUrl = `http://localhost/mycrm//download/invoice`+ `?invoiceNumber=DFL-02/0104`+ `&superadminId=1234567890`;

  window.open(pdfUrl, '_blank');

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: respPayload.respMesg || 'Invoice generated successfully'
            });

            // Optional reset
            // this.resetForm();

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


// submitInvoice(): void {

//   this.calculateTotals();

//   const payload = this.invoiceForm.getRawValue();

//   this.invoiceService.saveInvoiceDetails(payload).subscribe({
//     next: (response: any) => {

//       console.log('API RESPONSE:', response);

//       if (response?.responseCode !== 200) {
//         this.messageService.add({
//           severity: 'error',
//           summary: response.responseCode.toString(),
//           detail: response.responseMessage
//         });
//         return;
//       }

//       const respPayload = response.payload;

//       if (respPayload?.respCode === '200') {
//         this.messageService.add({
//           severity: 'success',
//           summary: 'Success',
//           detail: respPayload.respMesg
//         });
//       } else {
//         this.messageService.add({
//           severity: 'error',
//           summary: respPayload?.respCode || 'Error',
//           detail: respPayload?.respMesg || 'Failed'
//         });
//       }
//     },

//     error: () => {
//       this.messageService.add({
//         severity: 'error',
//         summary: '500',
//         detail: 'Internal Server Error'
//       });
//     }
//   });
// }


  // ================= RESET FORM =================
  resetForm(): void {
    this.invoiceForm.reset();
    this.items.clear();
    this.createInvoiceForm();
    this.addItem();
  }
}
