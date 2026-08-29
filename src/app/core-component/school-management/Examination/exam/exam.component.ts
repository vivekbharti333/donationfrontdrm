import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { ExamService } from './exam.service';

@Component({ selector: 'app-exam', templateUrl: './exam.component.html', styleUrl: './exam.component.scss' })
export class ExamComponent implements OnInit, OnDestroy {
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  readonly examTypeOptions = [
    { value: 'UNIT_TEST', name: 'Unit Test' }, { value: 'MID_TERM', name: 'Mid Term' },
    { value: 'FINAL', name: 'Final Examination' }, { value: 'PRACTICAL', name: 'Practical' },
    { value: 'OTHER', name: 'Other' }
  ];
  fullData: any[] = []; tableData: any[] = []; serialNumberArray: number[] = [];
  totalData = 0; pageSize = 10; searchDataValue = ''; selectedAcademicYear = '';
  selectedExamType = ''; selectedStatus = ''; isLoading = false; errorMessage = '';
  isSaving = false; isUpdating = false; addExamForm!: FormGroup; editExamForm!: FormGroup;
  private currentSkip = 0; private addDialog?: MatDialogRef<any>; private editDialog?: MatDialogRef<any>;
  private readonly destroy$ = new Subject<void>();

  constructor(private examService: ExamService, private pagination: PaginationService,
    private router: Router, private fb: FormBuilder, private dialog: MatDialog,
    private messageService: MessageService) {}

  ngOnInit(): void {
    this.addExamForm = this.createExamForm();
    this.editExamForm = this.createExamForm(true);
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((page: tablePageSize) => {
      if (this.router.url.includes('/exam')) { this.pageSize = page.pageSize; this.currentSkip = page.skip; this.applyPagination(); }
    });
    this.getExamDetails();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  getExamDetails(): void {
    this.isLoading = true; this.errorMessage = '';
    this.examService.getExamDetails({ searchText: this.searchDataValue, academicYear: this.selectedAcademicYear,
      examType: this.selectedExamType, status: this.selectedStatus }).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        if (!Array.isArray(rows) && Number(response?.responseCode) !== 200) this.errorMessage = response?.responseMessage || 'Unable to load exams.';
        this.currentSkip = 0; this.applyPagination(); this.isLoading = false;
      },
      error: (error: any) => { this.fullData = []; this.applyPagination(); this.errorMessage = error?.error?.responseMessage || 'Unable to load exams.'; this.isLoading = false; }
    });
  }

  searchExams(): void { this.currentSkip = 0; this.getExamDetails(); }
  clearFilters(): void { this.searchDataValue = ''; this.selectedAcademicYear = ''; this.selectedExamType = ''; this.selectedStatus = ''; this.getExamDetails(); }

  openAddExam(template: TemplateRef<any>): void {
    this.addExamForm.reset({ examCode: '', examName: '', examType: '', academicYear: '', startDate: '', endDate: '', description: '', status: 'ACTIVE' });
    this.addDialog = this.openDialog(template);
  }

  addExamDetails(): void {
    if (this.addExamForm.invalid || this.isSaving) { this.addExamForm.markAllAsTouched(); return; }
    this.isSaving = true;
    this.examService.addExamDetails(this.addExamForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (!this.isSuccessful(response)) { this.showMessage('Unable to add exam', this.responseMessage(response, 'Exam could not be added.'), 'error'); return; }
        this.addDialog?.close(); this.showMessage('Exam added', this.responseMessage(response, 'Exam added successfully.'), 'success'); this.getExamDetails();
      },
      error: (error: any) => { this.isSaving = false; this.showMessage('Unable to add exam', error?.error?.responseMessage || 'Exam could not be added.', 'error'); }
    });
  }

  openEditExam(template: TemplateRef<any>, exam: any): void {
    this.editExamForm.reset({ id: exam?.id, examCode: exam?.examCode || '', examName: exam?.examName || '',
      examType: exam?.examType || '', academicYear: exam?.academicYear || '', startDate: this.toDateInput(exam?.startDate),
      endDate: this.toDateInput(exam?.endDate), description: exam?.description || '', status: exam?.status || 'ACTIVE' });
    this.editDialog = this.openDialog(template);
  }

  updateExamDetails(): void {
    if (this.editExamForm.invalid || this.isUpdating) { this.editExamForm.markAllAsTouched(); return; }
    this.isUpdating = true;
    this.examService.updateExamDetails(this.editExamForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.isUpdating = false;
        if (!this.isSuccessful(response)) { this.showMessage('Unable to update exam', this.responseMessage(response, 'Exam could not be updated.'), 'error'); return; }
        this.editDialog?.close(); this.showMessage('Exam updated', this.responseMessage(response, 'Exam updated successfully.'), 'success'); this.getExamDetails();
      },
      error: (error: any) => { this.isUpdating = false; this.showMessage('Unable to update exam', error?.error?.responseMessage || 'Exam could not be updated.', 'error'); }
    });
  }

  sortData(sort: Sort): void {
    if (!sort.active || !sort.direction) return;
    const direction = sort.direction === 'asc' ? 1 : -1;
    this.fullData = [...this.fullData].sort((a, b) => String(a?.[sort.active] ?? '').localeCompare(
      String(b?.[sort.active] ?? ''), undefined, { numeric: true, sensitivity: 'base' }) * direction);
    this.applyPagination();
  }

  examTypeLabel(value: string): string { return this.examTypeOptions.find(type => type.value === value)?.name || value || '—'; }

  private createExamForm(includeId = false): FormGroup {
    return this.fb.group({ ...(includeId ? { id: [null, Validators.required] } : {}),
      examCode: ['', [Validators.required, Validators.maxLength(30)]], examName: ['', [Validators.required, Validators.maxLength(100)]],
      examType: ['', Validators.required], academicYear: ['', Validators.required], startDate: ['', Validators.required],
      endDate: ['', Validators.required], description: ['', Validators.maxLength(500)], status: ['ACTIVE', Validators.required]
    }, { validators: this.dateRangeValidator() });
  }

  private dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get('startDate')?.value; const end = control.get('endDate')?.value;
      return start && end && end < start ? { invalidDateRange: true } : null;
    };
  }

  private openDialog(template: TemplateRef<any>): MatDialogRef<any> { return this.dialog.open(template, { width: '820px', maxWidth: '96vw', disableClose: true, panelClass: 'custom-modal' }); }
  private isSuccessful(response: any): boolean { return Number(response?.responseCode) === 200 && Number(response?.payload?.respCode) === 200; }
  private responseMessage(response: any, fallback: string): string { return response?.payload?.respMesg || response?.responseMessage || fallback; }
  private toDateInput(value: any): string { return value ? String(value).slice(0, 10) : ''; }
  private applyPagination(): void {
    this.totalData = this.fullData.length; if (this.currentSkip >= this.totalData) this.currentSkip = 0;
    this.tableData = this.fullData.slice(this.currentSkip, this.currentSkip + this.pageSize);
    this.serialNumberArray = this.tableData.map((_, index) => this.currentSkip + index + 1);
    this.pagination.calculatePageSize.next({ totalData: this.totalData, pageSize: this.pageSize, tableData: this.tableData, serialNumberArray: this.serialNumberArray });
  }
  private showMessage(summary: string, detail: string, severity: 'success' | 'error'): void { this.messageService.add({ summary, detail, severity }); }
}
