import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { GenerateSchoolReceiptService } from './generate-school-receipt.service';

@Component({
  selector: 'app-generate-school-receipt',
  templateUrl: './generate-school-receipt.component.html',
  styleUrl: './generate-school-receipt.component.scss',
  providers: [MessageService, ToastModule],
})
export class GenerateSchoolReceiptComponent {

receiptForm!: FormGroup;
studentSearchForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService,
    private generateSchoolReceiptService: GenerateSchoolReceiptService,
  ) {}

  ngOnInit(): void {
    this.createReceiptForm();
    this.createSearchForm();
    this.addFeeRow(); // at least one fee row by default
  }

   createSearchForm(): void {
    this.studentSearchForm = this.fb.group({

      // Search Info
      grade: [''],
      gradeSection: [''],
      academicSession: ['2026-2027'],


    });
  }

  // ================= CREATE FORM =================
  createReceiptForm(): void {
    this.receiptForm = this.fb.group({

      // Student Info
      admissionNo: ['', Validators.required],
      rollNumber: [''],
      studentName: ['', Validators.required],
      grade: [''],
      gradeSection: [''],
      academicSession: ['2026-2027'],

      // Receipt Info
      receiptNumber: ['', Validators.required],
      installmentName: [''],
      paymentMode: [''],
      paymentDate: [''],

      // Fee Details (FormArray)
      receiptDetails: this.fb.array([]),

      // Amount Summary
      totalAmount: [{ value: 0, disabled: true }],
      discountAmount: [0],
      fineAmount: [0],
      netAmount: [{ value: 0, disabled: true }],

      // Audit
      createdBy: ['admin01'],
      createdByName: ['Super Admin'],
      superadminId: ['SA001'],
      status: ['PAID']
    });
  }

  // ================= GET FORM ARRAY =================
  get receiptDetails(): FormArray {
    return this.receiptForm.get('receiptDetails') as FormArray;
  }

  // ================= ADD FEE ROW =================
  addFeeRow(): void {
    const feeGroup = this.fb.group({
      feeType: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
    });

    this.receiptDetails.push(feeGroup);
  }

  // ================= REMOVE FEE ROW =================
  removeFeeRow(index: number): void {
    this.receiptDetails.removeAt(index);
    this.calculateTotals();
  }

  // ================= CALCULATE TOTALS =================
  calculateTotals(): void {
    let total = 0;

    this.receiptDetails.controls.forEach(control => {
      const amount = Number(control.get('amount')?.value) || 0;
      total += amount;
    });

    const discount = Number(this.receiptForm.get('discountAmount')?.value) || 0;
    const fine = Number(this.receiptForm.get('fineAmount')?.value) || 0;

    const netAmount = total - discount + fine;

    this.receiptForm.patchValue({
      totalAmount: total,
      netAmount: netAmount
    }, { emitEvent: false });
  }

  // ================= SUBMIT RECEIPT =================

  submitReceipt() {
    this.generateSchoolReceiptService.submitReceipt(this.receiptForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {


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
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: () =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
          }),
      });
  }

  // submitReceipt(): void {

  //   if (this.receiptForm.invalid) {
  //     this.receiptForm.markAllAsTouched();
  //     return;
  //   }

  //   const payload = {
  //     ...this.receiptForm.getRawValue()
  //   };

  //   const request = {
  //     payload: payload
  //   };

  //   this.http.post('http://localhost:8080/addReceipt', request)
  //     .subscribe({
  //       next: (res: any) => {
  //         alert('Receipt generated successfully');
  //         this.resetForm();
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         alert('Failed to generate receipt');
  //       }
  //     });
  // }

  // ================= RESET FORM =================
  resetForm(): void {
    this.receiptForm.reset();
    this.receiptDetails.clear();
    this.addFeeRow();
  }

  submitSearch(){
    
  }

}
