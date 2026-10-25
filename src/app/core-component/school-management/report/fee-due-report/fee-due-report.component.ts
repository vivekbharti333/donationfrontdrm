import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { DropdownModule } from 'primeng/dropdown';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';
import { DueFeeFilters, DueSchoolHeader, FeeDueReportService } from './fee-due-report.service';
import { DueStudentGroup, groupDueFeeRows } from './fee-due-report.model';
import { appendStudentDueSlips, DUE_SLIP_PRINT_STYLES } from './due-fee-slip-print';

interface FilterOption { value: string; label: string; }
interface StudentOption { id: number; label: string; }
interface FeeTypeOption { id: number; label: string; }

@Component({
  selector: 'app-fee-due-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, DropdownModule],
  templateUrl: './fee-due-report.component.html',
  styleUrl: './fee-due-report.component.scss'
})
export class FeeDueReportComponent implements OnInit, OnDestroy {
  printError = '';
  schoolHeader: DueSchoolHeader = { name: '', logo: '' };
  schoolLogoError = '';
  isSchoolHeaderLoading = true;
  private schoolHeaderError = '';
  private printFrame?: HTMLIFrameElement;
  readonly academicYears = Constant.ACADEMIC_YEAR_OPTIONS;
  readonly sections = Constant.SECTION_OPTIONS;
  readonly months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November',
    'December', 'January', 'February', 'March'];
  sessionName = this.currentSession();
  grade = '';
  gradeSection = '';
  studentId: number | null = null;
  feeTypeIds: number[] = [];
  dueThroughMonth = 'ALL_PREVIOUS';
  grades: FilterOption[] = [];
  students: StudentOption[] = [];
  feeTypes: FeeTypeOption[] = [];
  studentGroups: DueStudentGroup[] = [];
  isLoading = false;
  isStudentsLoading = false;
  hasSearched = false;
  errorMessage = '';
  optionMessages: string[] = [];
  studentsError = '';
  resultDescription = '';
  page = 1;
  pageSize = 10;
  private reportRequest?: Subscription;
  private studentRequest?: Subscription;
  private readonly destroyed = new Subject<void>();

  constructor(private reportService: FeeDueReportService, private schoolService: SchoolManagementService) {}

  ngOnInit(): void {
    this.reportService.getSchoolHeader().pipe(takeUntil(this.destroyed)).subscribe({
      next: header => { this.schoolHeader = header; this.isSchoolHeaderLoading = false; },
      error: () => {
        this.isSchoolHeaderLoading = false;
        this.schoolHeaderError = 'Unable to load the school name and logo. Check the school receipt header and reload the page before printing.';
      }
    });
    this.schoolService.getGradeDetails().pipe(takeUntil(this.destroyed)).subscribe({
      next: response => {
        if (this.failed(response)) { this.optionMessages.push(response.responseMessage || 'Unable to load classes.'); return; }
        this.grades = this.rows(response).map(row => ({
          value: String(row.gradeName || row.name || ''), label: String(row.gradeName || row.name || '')
        })).filter(option => option.value);
      },
      error: () => this.optionMessages.push('Unable to load classes. Try reloading the page.')
    });
    this.schoolService.getFeeTypeDetails().pipe(takeUntil(this.destroyed)).subscribe({
      next: response => {
        if (this.failed(response)) { this.optionMessages.push(response.responseMessage || 'Unable to load fee types.'); return; }
        this.feeTypes = this.rows(response).map(row => ({ id: Number(row.id), label: String(row.feeTypeName || '') }))
          .filter(option => option.id > 0 && option.label);
      },
      error: () => this.optionMessages.push('Unable to load fee types. Try reloading the page.')
    });
    this.loadStudents();
  }

  filtersChanged(reloadStudents = false): void {
    this.printError = '';
    this.reportRequest?.unsubscribe();
    this.isLoading = false;
    this.hasSearched = false;
    this.errorMessage = '';
    this.studentGroups = [];
    this.page = 1;
    if (reloadStudents) { this.studentId = null; this.loadStudents(); }
  }

  loadReport(): void {
    if (this.isLoading || !this.sessionName || !this.dueThroughMonth) return;
    this.isLoading = true;
    this.hasSearched = true;
    this.errorMessage = '';
    this.studentGroups = [];
    this.page = 1;
    const filters: DueFeeFilters = { sessionName: this.sessionName };
    const previous = this.dueThroughMonth === 'ALL_PREVIOUS';
    if (previous) filters.includePreviousSessions = true;
    else filters.dueThroughMonth = this.dueThroughMonth;
    if (this.grade) filters.grade = this.grade;
    if (this.gradeSection) filters.gradeSection = this.gradeSection;
    if (this.studentId != null) filters.studentId = this.studentId;
    if (this.feeTypeIds.length) filters.feeTypeIds = [...this.feeTypeIds];
    this.resultDescription = `${this.sessionName}${previous ? ' and earlier years · All previous dues up to today' : ' · Due through ' + this.dueThroughMonth} · ${this.grade || 'All classes'}${this.gradeSection ? ' / ' + this.gradeSection : ''}`;
    this.reportRequest = this.reportService.getReport(filters).pipe(takeUntil(this.destroyed)).subscribe({
      next: response => {
        this.isLoading = false;
        if (Number(response?.responseCode) === Constant.NO_CONTENT_CODE) return;
        if (Number(response?.responseCode) !== Constant.SUCCESS_CODE || !Array.isArray(response?.listPayload)) {
          this.errorMessage = response?.responseMessage || 'Unable to load the due fee report.';
          return;
        }
        this.studentGroups = groupDueFeeRows(response.listPayload, previous);
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = this.reportError(error);
      }
    });
  }

  reset(): void {
    this.sessionName = this.currentSession();
    this.grade = ''; this.gradeSection = ''; this.studentId = null; this.feeTypeIds = [];
    this.dueThroughMonth = 'ALL_PREVIOUS';
    this.filtersChanged(true);
  }

  get visibleStudents(): DueStudentGroup[] { return this.studentGroups.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.studentGroups.length / this.pageSize)); }
  get feeCount(): number { return this.studentGroups.reduce((sum, student) => sum + student.fees.length, 0); }
  get reviewCount(): number { return this.studentGroups.reduce((sum, student) => sum + student.fees.filter(fee => fee.requiresReview).length, 0); }
  get totalDue(): number {
    return this.studentGroups.reduce((sum, student) => sum + student.fees.reduce((amount, fee) =>
      amount + (fee.totalDue == null ? 0 : Math.round(fee.totalDue * 100)), 0), 0) / 100;
  }
  get firstStudent(): number { return this.studentGroups.length ? (this.page - 1) * this.pageSize + 1 : 0; }
  get lastStudent(): number { return Math.min(this.page * this.pageSize, this.studentGroups.length); }
  trackStudent(_index: number, student: DueStudentGroup): number { return student.key; }
  setPage(page: number): void { this.page = Math.max(1, Math.min(page, this.totalPages)); }

  printReport(): void {
    if (this.isLoading || this.errorMessage || !this.studentGroups.length) return;
    if (this.isSchoolHeaderLoading) { this.printError = 'School details are loading. Please try again shortly.'; return; }
    if (!this.schoolHeader.name) { this.printError = this.schoolHeaderError || 'Add the school name to the receipt header before printing.'; return; }
    this.printError = '';
    this.printFrame?.remove();
    const frame = document.createElement('iframe');
    frame.title = 'Fee due report print frame';
    Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '210mm', height: '297mm',
      border: '0', opacity: '0', pointerEvents: 'none' });
    document.body.appendChild(frame);
    this.printFrame = frame;
    const target = frame.contentDocument;
    const printWindow = frame.contentWindow;
    if (!target || !printWindow) { frame.remove(); this.printError = 'Unable to open print preview. Please try again.'; return; }
    const cleanup = () => { frame.remove(); if (this.printFrame === frame) this.printFrame = undefined; };
    printWindow.addEventListener('afterprint', cleanup, { once: true });
    frame.onload = async () => {
      try {
        await target.fonts.ready;
        await Promise.all(Array.from(target.images).map(async image => {
          for (const source of [image.src, ...(this.schoolHeader.logoFallbacks || [])]) {
            image.src = source;
            try { await image.decode(); return; } catch { /* Try the same school's legacy image endpoint. */ }
          }
          image.remove();
        }));
        if (!frame.isConnected) return;
        printWindow.focus(); printWindow.print();
      } catch {
        cleanup(); this.printError = 'Unable to open print preview. Please try again.';
      }
    };
    target.open();
    target.write(`<!doctype html><html><head><meta charset="utf-8"><style>${DUE_SLIP_PRINT_STYLES}</style></head><body></body></html>`);
    target.title = `Due Slip - ${this.sessionName}`;
    appendStudentDueSlips(target, this.studentGroups, this.schoolHeader);
    target.close();
  }

  private loadStudents(): void {
    this.studentRequest?.unsubscribe();
    this.students = []; this.studentsError = ''; this.isStudentsLoading = true;
    this.studentRequest = this.schoolService.getStudentAcademicDetails({
      sessionName: this.sessionName, grade: this.grade, gradeSection: this.gradeSection
    }).pipe(takeUntil(this.destroyed)).subscribe({
      next: response => {
        this.isStudentsLoading = false;
        if (this.failed(response)) { this.studentsError = response.responseMessage || 'Unable to load students.'; return; }
        this.students = this.rows(response).map(row => {
          const name = row.studentName || [row.firstName, row.lastName].filter(Boolean).join(' ');
          const admission = row.admissionNo || row.admissionNumber;
          return { id: Number(row.studentId ?? row.id), label: `${name || 'Student'}${admission ? ' (' + admission + ')' : ''}` };
        }).filter(option => option.id > 0);
      },
      error: () => { this.isStudentsLoading = false; this.studentsError = 'Unable to load the student filter. You can still view all students.'; }
    });
  }

  onSchoolLogoError(): void {
    const alternatives = this.schoolHeader.logoFallbacks || [];
    if (alternatives.length) {
      this.schoolHeader = { ...this.schoolHeader, logo: alternatives[0], logoFallbacks: alternatives.slice(1) };
    } else {
      this.schoolHeader = { ...this.schoolHeader, logo: '' };
      this.schoolLogoError = 'The school logo could not be loaded. Check the logo saved in the receipt header.';
    }
  }

  private rows(response: any): any[] {
    const rows = response?.listPayload ?? response?.payload ?? response?.data;
    return Array.isArray(rows) ? rows : [];
  }
  private reportError(error: any): string {
    if (error?.error?.responseMessage) return error.error.responseMessage;
    switch (Number(error?.status)) {
      case 0: return 'Unable to reach the due fee report API. Check the connection and server CORS settings. A blocked preflight request can also mean the updated backend is not deployed.';
      case 401: return 'Your session has expired. Please sign in again.';
      case 403: return 'The server denied the due fee report request (HTTP 403). Check the signed-in school and server access settings.';
      case 404:
      case 405: return 'The due fee report API is unavailable. Deploy the updated backend and try again.';
      case 500: return 'Unable to load the due fee report: server error (HTTP 500). Check the backend log for getStudentDueFeeReport.';
      case 502:
      case 503:
      case 504: return 'The report server is temporarily unavailable. Please try again shortly.';
      default: return 'Unable to load the due fee report. Please try again.';
    }
  }
  private failed(response: any): boolean {
    return response?.responseCode != null && ![Constant.SUCCESS_CODE, Constant.NO_CONTENT_CODE].includes(Number(response.responseCode));
  }
  private currentSession(): string {
    const now = new Date(); const year = now.getFullYear() - (now.getMonth() < 3 ? 1 : 0);
    const session = `${year}-${String((year + 1) % 100).padStart(2, '0')}`;
    return Constant.ACADEMIC_YEAR_OPTIONS.some(option => option.value === session) ? session : Constant.ACADEMIC_YEAR_OPTIONS[0].value;
  }

  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); this.printFrame?.remove(); }

}
