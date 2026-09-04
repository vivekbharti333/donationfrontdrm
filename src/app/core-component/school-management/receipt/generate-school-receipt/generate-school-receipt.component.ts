import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { GenerateSchoolReceiptService } from './generate-school-receipt.service';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { SchoolManagementService } from '../../school-management.service';
import { TenantMediaUrlService } from 'src/app/core/service/tenant-media-url.service';

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
  gradeOptions: any[] = [];
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  readonly sectionOptions = Constant.SECTION_OPTIONS;
  isGradesLoading = false;
  isAssignedFeesLoading = false;
  assignedFeesError = '';
  invoiceHeader: any = null;
  isLoading = false;
  isSubmitting = false;
  isReceiptPreviewVisible = false;
  loginUser: any;


  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService,
    private generateSchoolReceiptService: GenerateSchoolReceiptService,
    private authenticationService: AuthenticationService,
    private schoolManagementService: SchoolManagementService,
    private tenantMediaUrl: TenantMediaUrlService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit(): void {
    this.createReceiptForm();
    this.createSearchForm();
    this.getGradeDetails();
    this.getInvoiceHeaderDetails();
    this.addFeeRow(); // at least one fee row by default

  }

  toggleReceiptPreview(): void {
    this.isReceiptPreviewVisible = !this.isReceiptPreviewVisible;
  }

  createSearchForm(): void {
    this.studentSearchForm = this.fb.group({
      // Search Info
      grade: ['', Validators.required],
      gradeSection: ['', Validators.required],
      academicSession: ['2026-27', Validators.required],
      admissionNo: ['']
    });
  }

  // ================= CREATE FORM =================
  createReceiptForm(): void {
    this.receiptForm = this.fb.group({

      // Student Info
      admissionNo: ['', Validators.required],
      studentId: [null],
      studentAcademicId: [null],
      rollNumber: [''],
      studentName: [''],
      fatherName: [''],
      motherName: [''],
      contactNo: [''],
      grade: [''],
      gradeSection: [''],
      academicSession: ['2026-27'],

      // Receipt Info
      receiptNumber: ['', Validators.required],
      installmentName: ['', Validators.required],
      paymentMode: ['', Validators.required],
      paymentDate: [this.currentDateTimeLocal(), Validators.required],

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

  get selectedFeeDetails(): any[] {
    return this.receiptDetails.controls.filter(control =>
      control.get('selected')?.value && !this.isZeroBalanceFee(control)
    );
  }

  isZeroBalanceFee(control: any): boolean {
    return Number(control?.get('balance')?.value) <= 0;
  }

  // ================= ADD FEE ROW =================
  addFeeRow(): void {
    const feeGroup = this.fb.group({
      selected: [true],
      studentFeeId: [null],
      studentAcademicId: [null],
      feeType: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      balance: [0]
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
      if (control.get('selected')?.value && !this.isZeroBalanceFee(control)) {
        const amount = Number(control.get('amount')?.value) || 0;
        total += amount;
      }
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
    const selectedReceiptDetails = this.receiptDetails.controls
      .filter(control => control.get('selected')?.value && !this.isZeroBalanceFee(control))
      .map(control => ({
        studentFeeId: control.get('studentFeeId')?.value,
        feeType: control.get('feeType')?.value,
        amount: Number(control.get('amount')?.value) || 0
      }));
    if (!selectedReceiptDetails.length) {
      this.messageService.add({
        summary: 'Select fee',
        detail: 'Please select at least one fee item to generate the receipt.',
        styleClass: 'danger-background-popover'
      });
      return;
    }
    if (selectedReceiptDetails.some(detail => !detail.studentFeeId)) {
      this.messageService.add({
        summary: 'Invalid fee item',
        detail: 'Only fees assigned to the selected student can be added to this receipt.',
        styleClass: 'danger-background-popover'
      });
      return;
    }
    this.isSubmitting = true;
    this.generateSchoolReceiptService.submitReceipt({
      ...this.receiptForm.getRawValue(),
      receiptDetails: selectedReceiptDetails
    })
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
      admissionNo: '', studentName: '', academicSession: '2026-27', totalAmount: 0, discountAmount: 0,
      fineAmount: 0, netAmount: 0, status: 'PAID', paymentDate: this.currentDateTimeLocal()
    });
    this.receiptDetails.clear();
    this.addFeeRow();
    this.selectedStudent = null;
  }

  submitSearch(): void {
    this.getStudentDetails();
  }

  onAcademicFilterChange(): void {
    this.studentSearchForm.patchValue({ admissionNo: '' }, { emitEvent: false });
    this.studentDetails = [];
    this.clearSelectedStudent();
    if (this.studentSearchForm.get('academicSession')?.value
      && this.studentSearchForm.get('grade')?.value
      && this.studentSearchForm.get('gradeSection')?.value) {
      this.getStudentDetails();
    }
  }

  getGradeDetails(): void {
    this.isGradesLoading = true;
    this.generateSchoolReceiptService.getGradeDetails().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.gradeOptions = Array.isArray(rows) ? rows : [];
        this.isGradesLoading = false;
      },
      error: () => {
        this.gradeOptions = [];
        this.isGradesLoading = false;
        this.messageService.add({ summary: 'Error', detail: 'Unable to load classes.', styleClass: 'danger-background-popover' });
      }
    });
  }

  getInvoiceHeaderDetails(): void {
    this.generateSchoolReceiptService.getInvoiceHeaderList().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.invoiceHeader = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (this.invoiceHeader) {
          const invoiceInitial = String(this.invoiceHeader.invoiceInitial || '').trim();
          const serialNumber = String(this.invoiceHeader.serialNumber ?? '').trim();
          this.receiptForm.patchValue({ receiptNumber: `${invoiceInitial}${serialNumber}` });
        }
      },
      error: () => {
        this.invoiceHeader = null;
        this.messageService.add({
          summary: 'Receipt header',
          detail: 'Unable to load receipt header details.',
          styleClass: 'danger-background-popover'
        });
      }
    });
  }

  get receiptCompanyName(): string {
    return [this.invoiceHeader?.companyFirstName, this.invoiceHeader?.companyLastName]
      .filter(Boolean).join(' ') || 'School Name';
  }

  get receiptCompanyLogo(): string {
    return this.receiptHeaderImage(this.invoiceHeader?.companyLogo);
  }

  get receiptCompanyStamp(): string {
    return this.receiptHeaderImage(this.invoiceHeader?.companyStamp);
  }

  private receiptHeaderImage(value: any): string {
    const image = String(value || '').trim();
    if (!image) return '';
    if (/^(data:image\/|blob:|https?:)/i.test(image)) return image;
    if (image.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(image)) {
      return `data:image/png;base64,${image}`;
    }
    const superadminId = String(this.invoiceHeader?.superadminId || '').trim();
    return this.tenantMediaUrl.receiptPicture(this.loginUser?.service, superadminId, image);
  }

  public amountInWords(value: number): string {
    const amount = Math.max(0, Math.floor(Number(value) || 0));
    if (amount === 0) return 'Zero Rupees Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const belowThousand = (number: number): string => {
      const words: string[] = [];
      if (number >= 100) { words.push(ones[Math.floor(number / 100)], 'Hundred'); number %= 100; }
      if (number >= 20) { words.push(tens[Math.floor(number / 10)]); number %= 10; }
      if (number > 0) words.push(ones[number]);
      return words.join(' ');
    };
    const parts: string[] = [];
    let remaining = amount;
    const units = [{ value: 10000000, name: 'Crore' }, { value: 100000, name: 'Lakh' },
      { value: 1000, name: 'Thousand' }];
    units.forEach(unit => {
      if (remaining >= unit.value) {
        parts.push(belowThousand(Math.floor(remaining / unit.value)), unit.name);
        remaining %= unit.value;
      }
    });
    if (remaining) parts.push(belowThousand(remaining));
    return `${parts.join(' ')} Rupees Only`;
  }

  getStudentDetails() {

    const grade = this.studentSearchForm.get('grade')?.value;
    const gradeSection = this.studentSearchForm.get('gradeSection')?.value;
    const academicSession = this.studentSearchForm.get('academicSession')?.value;

    if (!academicSession || !grade || !gradeSection) {
      this.studentDetails = [];
      this.selectedStudent = null;
      this.studentSearchForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.generateSchoolReceiptService.getStudentAcademicDetails({
      sessionName: academicSession,
      grade,
      gradeSection
    })
      .subscribe({
        next: (res) => {
          const rows = res?.listPayload ?? res?.payload ?? res?.data;
          this.studentDetails = Array.isArray(rows) ? rows : [];
          this.isLoading = false;
        },
        error: () => {
          this.studentDetails = [];
          this.isLoading = false;
          this.messageService.add({ summary: 'Error', detail: 'Unable to load students. Please try again.', styleClass: 'danger-background-popover' });
        }
      });
  }

  resetStudentSearch(): void {
    this.studentSearchForm.reset({ academicSession: '2026-27', grade: '', gradeSection: '', admissionNo: '' });
    this.studentDetails = [];
    this.clearSelectedStudent();
  }


  onStudentChange(student: any): void {
    this.selectedStudent = student || null;


    if (this.selectedStudent) {

      this.receiptForm.patchValue({

        admissionNo: this.selectedStudent.admissionNo,
        studentId: this.selectedStudent.studentId || this.selectedStudent.id,

        rollNumber: this.selectedStudent.rollNumber,

        studentName:
          `${this.selectedStudent.firstName || ''} ${this.selectedStudent.lastName || ''}`.trim(),

        fatherName: this.selectedStudent.fatherName || '',
        motherName: this.selectedStudent.motherName || '',
        contactNo: this.selectedStudent.contactNo || this.selectedStudent.mobileNo || this.selectedStudent.fatherMobileNo || '',

        grade: this.selectedStudent.grade,

        gradeSection: this.selectedStudent.gradeSection,

        academicSession: this.selectedStudent.sessionName

      });
      this.loadAssignedFees(this.selectedStudent);
    } else {
      this.clearSelectedStudent();
    }
  }

  loadAssignedFees(student: any): void {
    const studentId = Number(student?.studentId ?? student?.id);
    const sessionName = String(student?.sessionName || this.studentSearchForm.get('academicSession')?.value || '').trim();
    if (!studentId || !sessionName) {
      this.receiptDetails.clear();
      this.calculateTotals();
      this.assignedFeesError = 'Student academic details are incomplete.';
      return;
    }

    this.isAssignedFeesLoading = true;
    this.assignedFeesError = '';
    this.receiptDetails.clear();
    this.calculateTotals();
    this.generateSchoolReceiptService.getAssignedFeeToStudentDetails(studentId, sessionName).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        const selectedGrade = String(student?.grade ?? '').trim();
        const selectedSection = String(student?.gradeSection ?? '').trim();
        const matchingFees = (Array.isArray(rows) ? rows : []).filter((fee: any) =>
          Number(fee?.studentId) === studentId
          && String(fee?.sessionName ?? '').trim() === sessionName
          && (!selectedGrade || String(fee?.grade ?? '').trim() === selectedGrade)
          && (!selectedSection || !fee?.gradeSection || String(fee.gradeSection).trim() === selectedSection)
        );
        const uniqueFees = [...new Map<string, any>(matchingFees.map((fee: any) => [
          String(fee?.feeStructureId ?? fee?.id), fee
        ] as [string, any])).values()];

        uniqueFees.forEach((fee: any) => {
          const amount = Number(fee?.balanceAmount ?? fee?.payableAmount ?? fee?.assignedAmount ?? 0);
          const balance = Number(fee?.balanceAmount ?? amount);
          this.receiptDetails.push(this.fb.group({
            selected: [false],
            studentFeeId: [fee?.id],
            studentAcademicId: [fee?.studentAcademicId],
            feeType: [fee?.feeTypeName || `Fee Structure ${fee?.feeStructureId ?? ''}`, Validators.required],
            amount: [balance > 0 ? Math.min(amount, balance) : 0,
              balance > 0 ? [Validators.required, Validators.min(1)] : []],
            balance: [balance]
          }));
        });
        this.receiptForm.patchValue({
          studentAcademicId: uniqueFees[0]?.studentAcademicId || null
        });
        this.assignedFeesError = uniqueFees.length ? '' : 'No assigned fees found for this student.';
        this.calculateTotals();
        this.isAssignedFeesLoading = false;
      },
      error: (error: any) => {
        this.receiptDetails.clear();
        this.calculateTotals();
        this.assignedFeesError = error?.error?.responseMessage || 'Unable to load the student assigned fees.';
        this.isAssignedFeesLoading = false;
      }
    });
  }

  private clearSelectedStudent(): void {
    this.selectedStudent = null;
    this.assignedFeesError = '';
    this.isAssignedFeesLoading = false;
    this.receiptDetails.clear();
    this.receiptForm.patchValue({
      admissionNo: '', rollNumber: '', studentName: '', fatherName: '', motherName: '',
      contactNo: '', studentId: null, studentAcademicId: null, grade: '', gradeSection: '', academicSession: '', totalAmount: 0, netAmount: 0
    });
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
    contactNo: rawData?.fatherMobileNo || rawData?.contactNo || rawData?.mobileNo
      || this.selectedStudent?.fatherMobileNo || this.selectedStudent?.contactNo
      || this.selectedStudent?.mobileNo || this.receiptForm.get('contactNo')?.value || '',
    grade: rawData?.grade || '',
    gradeSection: rawData?.gradeSection || '',
    academicSession: rawData?.academicSession || '',
    installmentName: rawData?.installmentName || '',
    paymentMode: rawData?.paymentMode || '',

    paymentDate: rawData?.paymentDate
      ? String(rawData.paymentDate).substring(0, 16)
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
  this.receiptDialog.afterClosed().subscribe(() => this.getInvoiceHeaderDetails());

}

createReceiptDetailGroup(data?: any): FormGroup {

  return this.fb.group({
    selected: [true],
    studentFeeId: [data?.studentFeeId || null],
    studentAcademicId: [data?.studentAcademicId || null],
    feeType: [data?.feeType || ''],
    amount: [data?.amount || 0],
    balance: [data?.balanceAmount ?? data?.balance ?? data?.amount ?? 0]
  });
}

studentImage(student: any): string {
  return this.schoolManagementService.studentImageUrl(student);
}

useDefaultStudentImage(event: Event): void {
  const image = event.target as HTMLImageElement;
  image.onerror = null;
  image.src = 'assets/img/profiles/avatar-02.jpg';
}

private currentDateTimeLocal(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().substring(0, 16);
}

  printReceipt(): void {
    const receipt = document.getElementById('printArea');
    if (!receipt) return;
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) return;
    const documentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML).join('');
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><title>${this.receiptForm.value.receiptNumber || 'Fee Receipt'}</title>${documentStyles}<style>@page{size:A4 portrait;margin:8mm}body{margin:0;background:#fff}.print-receipt{box-shadow:none!important;margin:0 auto!important;max-width:none!important}</style></head><body>${receipt.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.focus(); printWindow.print(); printWindow.close(); };
  }

  asFormGroup(control: any): FormGroup {

  return control as FormGroup;
}

}
