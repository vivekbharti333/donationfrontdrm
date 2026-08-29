import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Constant } from 'src/app/core/constant/constants';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { GradeSubjectService } from './grade-subject.service';

@Component({
  selector: 'app-grade-subject',
  templateUrl: './grade-subject.component.html',
  styleUrl: './grade-subject.component.scss'
})
export class GradeSubjectComponent implements OnInit, OnDestroy {
  readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  fullData: any[] = [];
  tableData: any[] = [];
  gradeOptions: any[] = [];
  subjectOptions: any[] = [];
  serialNumberArray: number[] = [];
  totalData = 0;
  pageSize = 10;
  selectedAcademicYear = '';
  selectedGradeId: number | null = null;
  selectedSubjectId: number | null = null;
  selectedSubjectType = '';
  selectedStatus = '';
  isLoading = false;
  isMastersLoading = false;
  errorMessage = '';
  addGradeSubjectForm!: FormGroup;
  editGradeSubjectForm!: FormGroup;
  isSaving = false;
  isUpdating = false;

  private currentSkip = 0;
  private addDialog?: MatDialogRef<any>;
  private editDialog?: MatDialogRef<any>;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private gradeSubjectService: GradeSubjectService,
    private pagination: PaginationService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.addGradeSubjectForm = this.fb.group({
      academicYear: ['', Validators.required],
      gradeId: [null, Validators.required],
      subjectId: [null, Validators.required],
      subjectType: ['CORE', Validators.required],
      status: ['ACTIVE', Validators.required]
    });
    this.editGradeSubjectForm = this.fb.group({
      id: [null, Validators.required],
      academicYear: ['', Validators.required],
      gradeId: [null, Validators.required],
      subjectId: [null, Validators.required],
      subjectType: ['CORE', Validators.required],
      status: ['ACTIVE', Validators.required]
    });
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((page: tablePageSize) => {
      if (this.router.url.includes('/grade-subject')) {
        this.pageSize = page.pageSize;
        this.currentSkip = page.skip;
        this.applyPagination();
      }
    });
    this.loadMasterData();
    this.getExamGradeSubject();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getExamGradeSubject(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.gradeSubjectService.getExamGradeSubject({
      academicYear: this.selectedAcademicYear,
      gradeId: this.selectedGradeId,
      subjectId: this.selectedSubjectId,
      subjectType: this.selectedSubjectType,
      status: this.selectedStatus
    }).subscribe({
      next: response => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        if (!Array.isArray(rows) && Number(response?.responseCode) !== 200) {
          this.errorMessage = response?.responseMessage || 'Unable to load grade subjects.';
        }
        this.currentSkip = 0;
        this.applyPagination();
        this.isLoading = false;
      },
      error: error => {
        this.fullData = [];
        this.applyPagination();
        this.errorMessage = error?.error?.responseMessage || 'Unable to load grade subjects.';
        this.isLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.selectedAcademicYear = '';
    this.selectedGradeId = null;
    this.selectedSubjectId = null;
    this.selectedSubjectType = '';
    this.selectedStatus = '';
    this.getExamGradeSubject();
  }

  openAddGradeSubject(template: TemplateRef<any>): void {
    this.addGradeSubjectForm.reset({
      academicYear: '',
      gradeId: null,
      subjectId: null,
      subjectType: 'CORE',
      status: 'ACTIVE'
    });
    this.addDialog = this.dialog.open(template, {
      width: '720px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  addExamGradeSubject(): void {
    if (this.addGradeSubjectForm.invalid || this.isSaving) {
      this.addGradeSubjectForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.gradeSubjectService.addExamGradeSubject(this.addGradeSubjectForm.getRawValue()).subscribe({
      next: response => {
        this.isSaving = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.showMessage(
            'Unable to assign subject',
            payload?.respMesg || response?.responseMessage || 'Subject could not be assigned.',
            'error'
          );
          return;
        }
        this.addDialog?.close();
        this.showMessage('Subject assigned', payload?.respMesg || 'Subject assigned successfully.', 'success');
        this.getExamGradeSubject();
      },
      error: error => {
        this.isSaving = false;
        this.showMessage(
          'Unable to assign subject',
          error?.error?.responseMessage || 'Subject could not be assigned.',
          'error'
        );
      }
    });
  }

  openEditGradeSubject(template: TemplateRef<any>, mapping: any): void {
    this.editGradeSubjectForm.reset({
      id: mapping?.id,
      academicYear: mapping?.academicYear || '',
      gradeId: mapping?.gradeId ?? null,
      subjectId: mapping?.subjectId ?? null,
      subjectType: mapping?.subjectType || 'CORE',
      status: mapping?.status || 'ACTIVE'
    });
    this.editDialog = this.dialog.open(template, {
      width: '720px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  updateExamGradeSubject(): void {
    if (this.editGradeSubjectForm.invalid || this.isUpdating) {
      this.editGradeSubjectForm.markAllAsTouched();
      return;
    }

    this.isUpdating = true;
    this.gradeSubjectService.updateExamGradeSubject(this.editGradeSubjectForm.getRawValue()).subscribe({
      next: response => {
        this.isUpdating = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.showMessage(
            'Unable to update assignment',
            payload?.respMesg || response?.responseMessage || 'Assignment could not be updated.',
            'error'
          );
          return;
        }
        this.editDialog?.close();
        this.showMessage('Assignment updated', payload?.respMesg || 'Assignment updated successfully.', 'success');
        this.getExamGradeSubject();
      },
      error: error => {
        this.isUpdating = false;
        this.showMessage(
          'Unable to update assignment',
          error?.error?.responseMessage || 'Assignment could not be updated.',
          'error'
        );
      }
    });
  }

  getGradeName(gradeId: any): string {
    const grade = this.gradeOptions.find(item => String(item?.id) === String(gradeId));
    return grade?.gradeName || grade?.name || (gradeId ? `Grade ${gradeId}` : '—');
  }

  getSubjectName(subjectId: any): string {
    const subject = this.subjectOptions.find(item => String(item?.id) === String(subjectId));
    return subject?.subjectName || (subjectId ? `Subject ${subjectId}` : '—');
  }

  getSubjectCode(subjectId: any): string {
    const subject = this.subjectOptions.find(item => String(item?.id) === String(subjectId));
    return subject?.subjectCode || '—';
  }

  sortData(sort: Sort): void {
    if (!sort.active || !sort.direction) return;
    const direction = sort.direction === 'asc' ? 1 : -1;
    this.fullData = [...this.fullData].sort((a, b) =>
      String(a?.[sort.active] ?? '').localeCompare(
        String(b?.[sort.active] ?? ''), undefined, { numeric: true, sensitivity: 'base' }
      ) * direction
    );
    this.applyPagination();
  }

  private loadMasterData(): void {
    this.isMastersLoading = true;
    forkJoin({
      grades: this.gradeSubjectService.getGradeDetails(),
      subjects: this.gradeSubjectService.getExamSubject()
    }).subscribe({
      next: result => {
        this.gradeOptions = this.extractRows(result.grades);
        this.subjectOptions = this.extractRows(result.subjects);
        this.isMastersLoading = false;
      },
      error: () => {
        this.gradeOptions = [];
        this.subjectOptions = [];
        this.isMastersLoading = false;
      }
    });
  }

  private extractRows(response: any): any[] {
    const rows = response?.listPayload ?? response?.payload ?? response?.data;
    return Array.isArray(rows) ? rows : [];
  }

  private applyPagination(): void {
    this.totalData = this.fullData.length;
    if (this.currentSkip >= this.totalData) this.currentSkip = 0;
    this.tableData = this.fullData.slice(this.currentSkip, this.currentSkip + this.pageSize);
    this.serialNumberArray = this.tableData.map((_, index) => this.currentSkip + index + 1);
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray
    });
  }

  private showMessage(summary: string, detail: string, severity: 'success' | 'error'): void {
    this.messageService.add({ summary, detail, severity });
  }
}
