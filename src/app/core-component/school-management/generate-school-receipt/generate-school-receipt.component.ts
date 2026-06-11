import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

  @ViewChild('dialogTemplate')
  dialogTemplate!: TemplateRef<any>;
    
  public receiptDialog: any;
  receiptForm!: FormGroup;
  studentSearchForm!: FormGroup;

  selectedStudent: any;

  studentDetails: any[] = [];
  isLoading = true;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private messageService: MessageService,
    private generateSchoolReceiptService: GenerateSchoolReceiptService,
  ) { }

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
      admissionNo: ['']
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
      totalAmount: [0],
      discountAmount: [0],
      fineAmount: [0],
      netAmount: [0],

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
          if (response['responseCode'] === 200) {
            if (response['payload']['respCode'] === 200) {

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });

              // Open receipt modal
              this.openEditModal(response['payload']);

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

  // ================= RESET FORM =================
  resetForm(): void {
    this.receiptForm.reset();
    this.receiptDetails.clear();
    this.addFeeRow();
  }

  submitSearch() {

  }

  getStudentDetails() {

    const grade = this.studentSearchForm.get('grade')?.value;
    const gradeSection = this.studentSearchForm.get('gradeSection')?.value;

    if (!grade || !gradeSection) {
      this.studentDetails = [];
      return;
    }

    this.isLoading = true;
    this.generateSchoolReceiptService.getStudentDetailsForFee(grade, gradeSection)
      .subscribe({
        next: (res) => {
          this.studentDetails = res?.listPayload || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }


  onStudentChange(admissionNo: any) {

    this.selectedStudent = this.studentDetails.find(
      (student: any) => student.admissionNo == admissionNo
    );


    if (this.selectedStudent) {

      this.receiptForm.patchValue({

        admissionNo: this.selectedStudent.admissionNo,

        rollNumber: this.selectedStudent.rollNumber,

        studentName:
          this.selectedStudent.firstName + ' ' +
          this.selectedStudent.lastName,

        grade: this.selectedStudent.grade,

        gradeSection: this.selectedStudent.gradeSection,

        academicSession: this.selectedStudent.sessionName

      });
    }
  }

openEditModal(rawData: any): void {

  // Clear old rows
  this.receiptDetails.clear();

  // Add receipt details
  rawData?.receiptDetails?.forEach((item: any) => {

    this.receiptDetails.push(
      this.createReceiptDetailGroup(item)
    );

  });

  // Patch form values
  this.receiptForm.patchValue({

    receiptNumber: rawData?.receiptNumber || '',
    admissionNo: rawData?.admissionNo || '',
    rollNumber: rawData?.rollNumber || '',
    studentName: rawData?.studentName || '',
    grade: rawData?.grade || '',
    gradeSection: rawData?.gradeSection || '',
    academicSession: rawData?.academicSession || '',
    installmentName: rawData?.installmentName || '',
    paymentMode: rawData?.paymentMode || '',

    paymentDate: rawData?.paymentDate
      ? rawData.paymentDate.split('T')[0]
      : '',

    totalAmount: rawData?.totalAmount || 0,
    discountAmount: rawData?.discountAmount || 0,
    fineAmount: rawData?.fineAmount || 0,
    netAmount: rawData?.netAmount || 0,

    status: rawData?.status || '',
    createdBy: rawData?.createdBy || '',
    createdByName: rawData?.createdByName || '',
    superadminId: rawData?.superadminId || ''

  });

  // Open dialog
  this.receiptDialog = this.dialog.open(
    this.dialogTemplate,
    {
      width: '100%',
      maxWidth: '900px',
      height: '90vh',
      disableClose: true,
      panelClass: 'custom-modal'
    }
  );

}

createReceiptDetailGroup(data?: any): FormGroup {

  return this.fb.group({
    feeType: [data?.feeType || ''],
    amount: [data?.amount || 0]
  });
}

  printReceipt() {
    window.print();
  }

  asFormGroup(control: any): FormGroup {

  return control as FormGroup;
}

}
