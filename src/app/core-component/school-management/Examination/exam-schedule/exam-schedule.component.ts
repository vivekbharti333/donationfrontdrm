import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, forkJoin, of, Subject, takeUntil } from 'rxjs';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { ExamScheduleService } from './exam-schedule.service';

@Component({ selector: 'app-exam-schedule', templateUrl: './exam-schedule.component.html', styleUrl: './exam-schedule.component.scss' })
export class ExamScheduleComponent implements OnInit, OnDestroy {
  fullData: any[] = []; tableData: any[] = []; exams: any[] = []; gradeSubjects: any[] = [];
  subjects: any[] = []; grades: any[] = []; serialNumberArray: number[] = [];
  totalData = 0; pageSize = 10; selectedExamId: number | null = null;
  selectedGradeSubjectId: number | null = null; selectedExamDate = ''; selectedStatus = '';
  isLoading = false; isMastersLoading = false; isSaving = false; isUpdating = false; errorMessage = '';
  addScheduleForm!: FormGroup; editScheduleForm!: FormGroup;
  private currentSkip = 0; private addDialog?: MatDialogRef<any>; private editDialog?: MatDialogRef<any>;
  private readonly destroy$ = new Subject<void>();

  constructor(private scheduleService: ExamScheduleService, private pagination: PaginationService,
    private router: Router, private fb: FormBuilder, private dialog: MatDialog,
    private messageService: MessageService) {}

  ngOnInit(): void {
    this.addScheduleForm = this.createForm(); this.editScheduleForm = this.createForm(true);
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe((page: tablePageSize) => {
      if (this.router.url.includes('/exam-schedule')) { this.pageSize = page.pageSize; this.currentSkip = page.skip; this.applyPagination(); }
    });
    this.loadMasters(); this.getExamSchedule();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadMasters(): void {
    this.isMastersLoading = true;
    forkJoin({
      exams: this.scheduleService.getExamDetails().pipe(catchError(() => of(null))),
      mappings: this.scheduleService.getExamGradeSubject().pipe(catchError(() => of(null))),
      subjects: this.scheduleService.getExamSubject().pipe(catchError(() => of(null))),
      grades: this.scheduleService.getGradeDetails().pipe(catchError(() => of(null)))
    }).subscribe({
      next: responses => {
        this.exams = this.rows(responses.exams); this.gradeSubjects = this.rows(responses.mappings);
        this.subjects = this.rows(responses.subjects); this.grades = this.rows(responses.grades);
        this.isMastersLoading = false;
        if (this.gradeSubjects.length === 0) {
          this.showMessage('No grade subjects found', 'Assign subjects to grades before creating an exam schedule.', 'error');
        }
      },
      error: () => { this.exams = []; this.gradeSubjects = []; this.subjects = []; this.grades = []; this.isMastersLoading = false; this.showMessage('Unable to load options', 'Exam and subject options could not be loaded.', 'error'); }
    });
  }

  getExamSchedule(): void {
    this.isLoading = true; this.errorMessage = '';
    this.scheduleService.getExamSchedule({ examId: this.selectedExamId, examGradeSubjectId: this.selectedGradeSubjectId,
      examDate: this.selectedExamDate, status: this.selectedStatus }).subscribe({
      next: response => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        if (!Array.isArray(rows) && Number(response?.responseCode) !== 200) this.errorMessage = response?.responseMessage || 'Unable to load exam schedules.';
        this.currentSkip = 0; this.applyPagination(); this.isLoading = false;
      },
      error: error => { this.fullData = []; this.applyPagination(); this.errorMessage = error?.error?.responseMessage || 'Unable to load exam schedules.'; this.isLoading = false; }
    });
  }

  clearFilters(): void { this.selectedExamId = null; this.selectedGradeSubjectId = null; this.selectedExamDate = ''; this.selectedStatus = ''; this.getExamSchedule(); }

  openAddSchedule(template: TemplateRef<any>): void {
    this.addScheduleForm.reset({ examId: null, examGradeSubjectId: null, examDate: '', startTime: '', endTime: '', maximumMarks: null, passingMarks: null, roomNumber: '', instructions: '', status: 'ACTIVE' });
    this.addDialog = this.openDialog(template);
  }

  addExamSchedule(): void {
    if (this.addScheduleForm.invalid || this.isSaving) { this.addScheduleForm.markAllAsTouched(); return; }
    this.isSaving = true;
    this.scheduleService.addExamSchedule(this.addScheduleForm.getRawValue()).subscribe({
      next: response => {
        this.isSaving = false;
        if (!this.success(response)) { this.showMessage('Unable to add schedule', this.message(response, 'Schedule could not be added.'), 'error'); return; }
        this.addDialog?.close(); this.showMessage('Schedule added', this.message(response, 'Exam schedule added successfully.'), 'success'); this.getExamSchedule();
      },
      error: error => { this.isSaving = false; this.showMessage('Unable to add schedule', error?.error?.responseMessage || 'Schedule could not be added.', 'error'); }
    });
  }

  openEditSchedule(template: TemplateRef<any>, schedule: any): void {
    this.editScheduleForm.reset({ id: schedule?.id, examId: schedule?.examId ?? null,
      examGradeSubjectId: schedule?.examGradeSubjectId ?? null, examDate: this.dateInput(schedule?.examDate),
      startTime: schedule?.startTime || '', endTime: schedule?.endTime || '', maximumMarks: schedule?.maximumMarks,
      passingMarks: schedule?.passingMarks, roomNumber: schedule?.roomNumber || '', instructions: schedule?.instructions || '', status: schedule?.status || 'ACTIVE' });
    this.editDialog = this.openDialog(template);
  }

  updateExamSchedule(): void {
    if (this.editScheduleForm.invalid || this.isUpdating) { this.editScheduleForm.markAllAsTouched(); return; }
    this.isUpdating = true;
    this.scheduleService.updateExamSchedule(this.editScheduleForm.getRawValue()).subscribe({
      next: response => {
        this.isUpdating = false;
        if (!this.success(response)) { this.showMessage('Unable to update schedule', this.message(response, 'Schedule could not be updated.'), 'error'); return; }
        this.editDialog?.close(); this.showMessage('Schedule updated', this.message(response, 'Exam schedule updated successfully.'), 'success'); this.getExamSchedule();
      },
      error: error => { this.isUpdating = false; this.showMessage('Unable to update schedule', error?.error?.responseMessage || 'Schedule could not be updated.', 'error'); }
    });
  }

  onExamChange(form: FormGroup): void { form.get('examGradeSubjectId')?.setValue(null); }
  gradeSubjectOptionsFor(form: FormGroup): any[] {
    const exam = this.exams.find(item => Number(item.id) === Number(form.get('examId')?.value));
    if (!exam) return this.gradeSubjects;
    const examYear = this.normalizeAcademicYear(exam.academicYear);
    return this.gradeSubjects.filter(item => this.normalizeAcademicYear(item.academicYear) === examYear);
  }
  examLabel(id: number): string { const item = this.exams.find(row => Number(row.id) === Number(id)); return item ? `${item.examName} (${item.examCode})` : `Exam #${id}`; }
  mappingLabel(id: number): string {
    const item = this.gradeSubjects.find(row => Number(row.id) === Number(id));
    if (!item) return `Grade Subject #${id}`;
    return `${this.gradeLabel(item.gradeId)} - ${this.subjectLabel(item.subjectId)}`;
  }
  gradeLabel(id: number): string { const item = this.grades.find(row => Number(row.id) === Number(id)); return item?.gradeName || item?.name || `Grade ${id}`; }
  subjectLabel(id: number): string { const item = this.subjects.find(row => Number(row.id) === Number(id)); return item?.subjectName || `Subject ${id}`; }

  sortData(sort: Sort): void {
    if (!sort.active || !sort.direction) return; const direction = sort.direction === 'asc' ? 1 : -1;
    this.fullData = [...this.fullData].sort((a, b) => String(a?.[sort.active] ?? '').localeCompare(String(b?.[sort.active] ?? ''), undefined, { numeric: true, sensitivity: 'base' }) * direction);
    this.applyPagination();
  }

  private createForm(includeId = false): FormGroup {
    return this.fb.group({ ...(includeId ? { id: [null, Validators.required] } : {}), examId: [null, Validators.required],
      examGradeSubjectId: [null, Validators.required], examDate: ['', Validators.required], startTime: ['', Validators.required],
      endTime: ['', Validators.required], maximumMarks: [null, [Validators.required, Validators.min(0.01)]],
      passingMarks: [null, [Validators.required, Validators.min(0)]], roomNumber: ['', Validators.maxLength(50)],
      instructions: ['', Validators.maxLength(1000)], status: ['ACTIVE', Validators.required]
    }, { validators: this.scheduleValidator() });
  }
  private scheduleValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get('startTime')?.value; const end = control.get('endTime')?.value;
      const maximum = Number(control.get('maximumMarks')?.value); const passing = Number(control.get('passingMarks')?.value);
      const errors: ValidationErrors = {};
      if (start && end && end <= start) errors['invalidTimeRange'] = true;
      if (Number.isFinite(maximum) && Number.isFinite(passing) && passing > maximum) errors['invalidMarks'] = true;
      return Object.keys(errors).length ? errors : null;
    };
  }
  private rows(response: any): any[] { const rows = response?.listPayload ?? response?.payload ?? response?.data; return Array.isArray(rows) ? rows : []; }
  private success(response: any): boolean { return Number(response?.responseCode) === 200 && Number(response?.payload?.respCode) === 200; }
  private message(response: any, fallback: string): string { return response?.payload?.respMesg || response?.responseMessage || fallback; }
  private dateInput(value: any): string { return value ? String(value).slice(0, 10) : ''; }
  private normalizeAcademicYear(value: any): string { return String(value ?? '').trim().replace(/\s+/g, '').replace(/\//g, '-'); }
  private openDialog(template: TemplateRef<any>): MatDialogRef<any> { return this.dialog.open(template, { width: '900px', maxWidth: '96vw', disableClose: true, panelClass: 'custom-modal' }); }
  private applyPagination(): void { this.totalData = this.fullData.length; if (this.currentSkip >= this.totalData) this.currentSkip = 0; this.tableData = this.fullData.slice(this.currentSkip, this.currentSkip + this.pageSize); this.serialNumberArray = this.tableData.map((_, i) => this.currentSkip + i + 1); this.pagination.calculatePageSize.next({ totalData: this.totalData, pageSize: this.pageSize, tableData: this.tableData, serialNumberArray: this.serialNumberArray }); }
  private showMessage(summary: string, detail: string, severity: 'success' | 'error'): void { this.messageService.add({ summary, detail, severity }); }
}
