import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { GenerateSchoolReceiptService } from './generate-school-receipt.service';

@Component({
  selector: 'app-generate-school-receipt',
  templateUrl: './generate-school-receipt.component.html',
  styleUrl: './generate-school-receipt.component.scss',
  providers: [MessageService],
})
export class GenerateSchoolReceiptComponent implements OnInit {

  @ViewChild('dialogTemplate')
  dialogTemplate!: TemplateRef<any>;
    
  public receiptDialog: any;
  receiptForm!: FormGroup;
  studentSearchForm!: FormGroup;

  selectedStudent: any;

  studentDetails: any[] = [];
  isLoading = false;
  isSubmitting = false;
  isReceiptPreviewVisible = false;
  private isResizingPreview = false;
  private resizeStartX = 0;


  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService,
    private generateSchoolReceiptService: GenerateSchoolReceiptService,
  ) { }

  ngOnInit(): void {
    this.createReceiptForm();
    this.createSearchForm();
    this.addFeeRow(); // at least one fee row by default

  }

  toggleReceiptPreview(): void {
    this.isReceiptPreviewVisible = !this.isReceiptPreviewVisible;
  }

  startPreviewResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizingPreview = true;
    this.resizeStartX = event.clientX;
  }

  @HostListener('document:mousemove', ['$event'])
  resizeReceiptPreview(event: MouseEvent): void {
    if (this.isResizingPreview && this.resizeStartX - event.clientX > 8) {
      this.isReceiptPreviewVisible = true;
    }
  }

  @HostListener('document:mouseup')
  stopPreviewResize(): void {
    this.isResizingPreview = false;
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
      admissionNo: ['TEST-VIVEK-001', Validators.required],
      rollNumber: [''],
      studentName: ['Vivek'],
      fatherName: [''],
      motherName: [''],
      contactNo: [''],
      grade: [''],
      gradeSection: [''],
      academicSession: ['2026-2027'],

      // Receipt Info
      receiptNumber: ['', Validators.required],
      installmentName: ['', Validators.required],
      paymentMode: ['', Validators.required],
      paymentDate: ['', Validators.required],

      // Fee Details (FormArray)
      receiptDetails: this.fb.array([]),

      // Amount Summary
      totalAmount: [0],
      discountAmount: [0, Validators.min(0)],
      fineAmount: [0, Validators.min(0)],
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
    if (this.receiptDetails.length === 1) {
      return;
    }
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

    const netAmount = Math.max(0, total - discount + fine);

    this.receiptForm.patchValue({
      totalAmount: total,
      netAmount: netAmount
    }, { emitEvent: false });
  }

  // ================= SUBMIT RECEIPT =================

  submitReceipt(): void {
    if (this.receiptForm.invalid || this.isSubmitting) {
      this.receiptForm.markAllAsTouched();

      if (!this.isSubmitting) {
        const missingFields: string[] = [];
        const fieldLabels: Record<string, string> = {
          admissionNo: 'student',
          receiptNumber: 'receipt number',
          installmentName: 'installment',
          paymentMode: 'payment mode',
          paymentDate: 'payment date'
        };

        Object.keys(fieldLabels).forEach((field) => {
          if (this.receiptForm.get(field)?.invalid) {
            missingFields.push(fieldLabels[field]);
          }
        });

        if (this.receiptDetails.invalid) {
          missingFields.push('valid fee type and amount');
        }

        this.messageService.add({
          summary: 'Complete required details',
          detail: `Please provide ${missingFields.join(', ')} before generating the receipt.`,
          styleClass: 'danger-background-popover',
        });
      }
      return;
    }

    this.calculateTotals();
    this.isSubmitting = true;
    this.generateSchoolReceiptService.submitReceipt(this.receiptForm.value)
      .subscribe({
        next: (response: any) => {
          const payload = response?.payload;
          const responseCode = Number(response?.responseCode);
          const payloadCode = Number(payload?.respCode);

          if (responseCode === 200 && payloadCode === 200) {

              this.messageService.add({
                summary: 'Receipt generated',
                detail: payload?.respMesg || 'The receipt was generated successfully.',
                styleClass: 'success-background-popover',
              });

              // Open receipt modal
              this.openEditModal(payload);
          } else {
            this.messageService.add({
              summary: String(payload?.respCode || response?.responseCode || 'Error'),
              detail: payload?.respMesg || response?.responseMessage || 'Unable to generate the receipt. Please try again.',
              styleClass: 'danger-background-popover',
            });
          }
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
          this.messageService.add({
            summary: '500',
            detail: 'Unable to generate the receipt. Please try again.',
            styleClass: 'danger-background-popover',
          });
        },
      });
  }

  // ================= RESET FORM =================
  resetForm(): void {
    this.receiptForm.reset({
      admissionNo: 'TEST-VIVEK-001', studentName: 'Vivek', academicSession: '2026-2027', totalAmount: 0, discountAmount: 0,
      fineAmount: 0, netAmount: 0, status: 'PAID'
    });
    this.receiptDetails.clear();
    this.addFeeRow();
    this.selectedStudent = null;
  }

  submitSearch(): void {
    this.getStudentDetails();
  }

  getStudentDetails() {

    const grade = this.studentSearchForm.get('grade')?.value;
    const gradeSection = this.studentSearchForm.get('gradeSection')?.value;

    if (!grade || !gradeSection) {
      this.studentDetails = [];
      this.selectedStudent = null;
      return;
    }

    this.isLoading = true;
    this.generateSchoolReceiptService.getStudentDetailsForFee(grade, gradeSection)
      .subscribe({
        next: (res) => {
          this.studentDetails = res?.listPayload || [];
          this.isLoading = false;
        },
        error: () => {
          this.studentDetails = [];
          this.isLoading = false;
          this.messageService.add({ summary: 'Error', detail: 'Unable to load students. Please try again.', styleClass: 'danger-background-popover' });
        }
      });
  }


  onStudentChange(student: any): void {
    this.selectedStudent = student || null;


    if (this.selectedStudent) {

      this.receiptForm.patchValue({

        admissionNo: this.selectedStudent.admissionNo,

        rollNumber: this.selectedStudent.rollNumber,

        studentName:
          `${this.selectedStudent.firstName || ''} ${this.selectedStudent.lastName || ''}`.trim(),

        fatherName: this.selectedStudent.fatherName || '',
        motherName: this.selectedStudent.motherName || '',
        contactNo: this.selectedStudent.contactNo || this.selectedStudent.mobileNo || '',

        grade: this.selectedStudent.grade,

        gradeSection: this.selectedStudent.gradeSection,

        academicSession: this.selectedStudent.sessionName

      });
    }
  }

  onStudentChangeByAdmissionNo(): void {
    const admissionNo = this.studentSearchForm.get('admissionNo')?.value;
    const student = this.studentDetails.find(
      (item: any) => String(item.admissionNo) === String(admissionNo)
    );
    this.onStudentChange(student);
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
    fatherName: rawData?.fatherName || this.selectedStudent?.fatherName || '',
    motherName: rawData?.motherName || this.selectedStudent?.motherName || '',
    contactNo: rawData?.contactNo || rawData?.mobileNo || this.selectedStudent?.contactNo || this.selectedStudent?.mobileNo || '',
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
