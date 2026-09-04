import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { pageSelection } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { GenerateSchoolReceiptService } from '../generate-school-receipt/generate-school-receipt.service';
import { SchoolReceiptListService } from './school-receipt-list.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { TenantMediaUrlService } from 'src/app/core/service/tenant-media-url.service';

@Component({
  selector: 'app-school-receipt-list',
  templateUrl: './school-receipt-list.component.html',
  styleUrls: ['./school-receipt-list.component.scss']
})
export class SchoolReceiptListComponent implements OnInit, OnDestroy {
  readonly routes = routes;
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  readonly sectionOptions = Constant.SECTION_OPTIONS;
  studentSearchForm!: FormGroup;
  receiptForm!: FormGroup;
  gradeOptions: any[] = [];
  studentDetails: any[] = [];
  fullData: any[] = [];
  filteredData: any[] = [];
  tableData: any[] = [];
  serialNumberArray: number[] = [];
  totalData = 0;
  pageSize = 10;
  currentSkip = 0;
  searchDataValue = '';
  isLoading = false;
  isStudentsLoading = false;
  isGradesLoading = false;
  errorMessage = '';
  receiptDialog: any;
  invoiceHeader: any = null;
  selectedReceipt: any = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private schoolReceiptListService: SchoolReceiptListService,
    private generateSchoolReceiptService: GenerateSchoolReceiptService,
    private pagination: PaginationService,
    private router: Router,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private tenantMediaUrl: TenantMediaUrlService
  ) {}

  ngOnInit(): void {
    this.createForms();
    this.getGradeDetails();
    this.getInvoiceHeaderDetails();
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((page: tablePageSize) => {
      if (this.router.url.includes('school-receipt-list')) {
        this.pageSize = page.pageSize;
        this.currentSkip = page.skip;
        this.prepareTableData();
      }
    });
    this.getReceiptDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForms(): void {
    this.studentSearchForm = this.fb.group({
      academicSession: [''], grade: [''], gradeSection: [''], admissionNo: [''],
      studentName: [''], rollNumber: [''], receiptNumber: ['']
    });
    this.receiptForm = this.fb.group({
      receiptNumber: [''], admissionNo: [''], rollNumber: [''], studentName: [''],
      fatherName: [''], contactNo: [''], dob: [''], address: [''], createdByName: [''],
      grade: [''], gradeSection: [''], academicSession: [''], installmentName: [''],
      paymentMode: [''], paymentDate: [''], totalAmount: [0], discountAmount: [0],
      fineAmount: [0], netAmount: [0], status: [''], receiptDetails: this.fb.array([])
    });
  }

  get receiptDetails(): FormArray { return this.receiptForm.get('receiptDetails') as FormArray; }

  get receiptCompanyName(): string {
    return [this.invoiceHeader?.companyFirstName, this.invoiceHeader?.companyLastName]
      .filter(Boolean).join(' ') || 'School Name';
  }

  get receiptCompanyLogo(): string { return this.imageData(this.invoiceHeader?.companyLogo); }
  get receiptCompanyStamp(): string { return this.imageData(this.invoiceHeader?.companyStamp); }

  private imageData(value: any): string {
    const image = String(value || '').trim();
    if (!image) return '';
    if (/^(data:image\/|blob:|https?:)/i.test(image)) return image;
    if (image.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(image)) {
      return `data:image/png;base64,${image}`;
    }
    const superadminId = String(this.invoiceHeader?.superadminId || '').trim();
    const loginUser = this.authenticationService.getLoginUser();
    return this.tenantMediaUrl.receiptPicture(loginUser?.service, superadminId, image);
  }

  getInvoiceHeaderDetails(): void {
    this.generateSchoolReceiptService.getInvoiceHeaderList().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.invoiceHeader = Array.isArray(rows) && rows.length ? rows[0] : null;
      },
      error: () => { this.invoiceHeader = null; }
    });
  }

  getGradeDetails(): void {
    this.isGradesLoading = true;
    this.generateSchoolReceiptService.getGradeDetails().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.gradeOptions = Array.isArray(rows) ? rows : [];
        this.isGradesLoading = false;
      },
      error: () => { this.gradeOptions = []; this.isGradesLoading = false; }
    });
  }

  onAcademicFilterChange(): void {
    this.studentSearchForm.patchValue({ admissionNo: '' }, { emitEvent: false });
    this.studentDetails = [];
    const value = this.studentSearchForm.getRawValue();
    if (!value.academicSession || !value.grade || !value.gradeSection) return;
    this.isStudentsLoading = true;
    this.generateSchoolReceiptService.getStudentAcademicDetails({
      sessionName: value.academicSession, grade: value.grade, gradeSection: value.gradeSection
    }).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.studentDetails = Array.isArray(rows) ? rows : [];
        this.isStudentsLoading = false;
      },
      error: () => { this.studentDetails = []; this.isStudentsLoading = false; }
    });
  }

  getReceiptDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.schoolReceiptListService.getReceiptDetails(this.studentSearchForm.getRawValue()).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        this.currentSkip = 0;
        this.applyLocalSearch();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.fullData = [];
        this.filteredData = [];
        this.prepareTableData();
        this.errorMessage = error?.error?.responseMessage || 'Unable to load receipts.';
        this.isLoading = false;
      }
    });
  }

  submitSearch(): void { this.getReceiptDetails(); }

  clearFilters(): void {
    this.studentSearchForm.reset({ academicSession: '', grade: '', gradeSection: '', admissionNo: '', studentName: '', rollNumber: '', receiptNumber: '' });
    this.studentDetails = [];
    this.searchDataValue = '';
    this.getReceiptDetails();
  }

  searchData(value: string): void {
    this.searchDataValue = value;
    this.currentSkip = 0;
    this.applyLocalSearch();
  }

  private applyLocalSearch(): void {
    const term = this.searchDataValue.trim().toLowerCase();
    this.filteredData = term ? this.fullData.filter(receipt => [receipt.receiptNumber, receipt.studentName,
      receipt.admissionNo, receipt.rollNumber, receipt.grade, receipt.gradeSection, receipt.paymentMode,
      receipt.status, receipt.installmentName].some(value => String(value ?? '').toLowerCase().includes(term))) : [...this.fullData];
    this.totalData = this.filteredData.length;
    this.prepareTableData();
  }

  private prepareTableData(): void {
    this.tableData = this.filteredData.slice(this.currentSkip, this.currentSkip + this.pageSize);
    this.serialNumberArray = this.tableData.map((_, index) => this.currentSkip + index + 1);
    this.pagination.calculatePageSize.next({ totalData: this.totalData, pageSize: this.pageSize,
      tableData: this.tableData, serialNumberArray: this.serialNumberArray });
  }

  sortData(sort: Sort): void {
    if (!sort.active || !sort.direction) return;
    const direction = sort.direction === 'asc' ? 1 : -1;
    this.filteredData = [...this.filteredData].sort((a, b) => String(a?.[sort.active] ?? '')
      .localeCompare(String(b?.[sort.active] ?? ''), undefined, { numeric: true }) * direction);
    this.currentSkip = 0;
    this.prepareTableData();
  }

  openReceipt(template: TemplateRef<any>, receipt: any): void {
    this.selectedReceipt = receipt;
    this.receiptForm.patchValue({
      ...receipt,
      fatherName: receipt?.fatherName || '',
      contactNo: receipt?.fatherMobileNo || receipt?.contactNo || ''
    });
    this.receiptDetails.clear();
    (receipt?.receiptDetails || []).forEach((item: any) => this.receiptDetails.push(this.fb.group({
      feeType: [item?.feeType || ''], amount: [Number(item?.amount || 0)]
    })));
    this.receiptDialog = this.dialog.open(template, { width: '920px', maxWidth: '96vw', maxHeight: '94vh', panelClass: 'receipt-view-dialog' });
  }

  studentLabel(student: any): string {
    return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(' ');
  }

  amountInWords(value: number): string {
    const amount = Math.max(0, Math.floor(Number(value) || 0));
    if (!amount) return 'Zero Rupees Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const wordsFor = (number: number): string => {
      const words: string[] = [];
      if (number >= 100) { words.push(ones[Math.floor(number / 100)], 'Hundred'); number %= 100; }
      if (number >= 20) { words.push(tens[Math.floor(number / 10)]); number %= 10; }
      if (number) words.push(ones[number]);
      return words.join(' ');
    };
    let remaining = amount;
    const parts: string[] = [];
    [{ value: 10000000, label: 'Crore' }, { value: 100000, label: 'Lakh' }, { value: 1000, label: 'Thousand' }]
      .forEach(unit => { if (remaining >= unit.value) { parts.push(wordsFor(Math.floor(remaining / unit.value)), unit.label); remaining %= unit.value; } });
    if (remaining) parts.push(wordsFor(remaining));
    return `${parts.join(' ')} Rupees Only`;
  }

  printReceipt(): void {
    const receipt = document.getElementById('receiptListPrintArea');
    if (!receipt) return;
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(node => node.outerHTML).join('');
    const printFrame = document.createElement('iframe');
    printFrame.setAttribute('title', 'Fee receipt print frame');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.opacity = '0';
    printFrame.style.pointerEvents = 'none';
    document.body.appendChild(printFrame);

    const frameWindow = printFrame.contentWindow;
    const frameDocument = printFrame.contentDocument;
    if (!frameWindow || !frameDocument) {
      printFrame.remove();
      return;
    }

    printFrame.onload = () => {
      frameWindow.focus();
      frameWindow.print();
      window.setTimeout(() => printFrame.remove(), 1000);
    };
    frameDocument.open();
    frameDocument.write(`<!doctype html><html><head><title>${this.receiptForm.value.receiptNumber || 'Fee Receipt'}</title>${styles}<style>@page{size:A4 portrait;margin:8mm}body{margin:0;background:#fff}.list-print-receipt{margin:0 auto!important;max-width:none!important}</style></head><body>${receipt.outerHTML}</body></html>`);
    frameDocument.close();
  }
}
