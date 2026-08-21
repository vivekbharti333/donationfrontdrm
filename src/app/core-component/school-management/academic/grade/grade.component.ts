import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { SchoolManagementService } from '../../school-management.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrl: './grade.component.scss'
})
export class GradeComponent implements OnInit, OnDestroy {
  public fullData: any[] = [];
  public tableData: any[] = [];
  public serialNumberArray: number[] = [];
  public totalData = 0;
  public pageSize = 10;
  public searchDataValue = '';
  public isLoading = false;
  public errorMessage = '';
  public addGradeForm!: FormGroup;
  public editGradeForm!: FormGroup;
  public isSaving = false;
  public isUpdating = false;

  private currentSkip = 0;
  private addDialog?: MatDialogRef<any>;
  private editDialog?: MatDialogRef<any>;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private schoolManagementService: SchoolManagementService,
    private pagination: PaginationService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.createForms();
    this.pagination.tablePageSize
      .pipe(takeUntil(this.destroy$))
      .subscribe((page: tablePageSize) => {
        if (this.router.url.includes('/grade')) {
          this.pageSize = page.pageSize;
          this.currentSkip = page.skip;
          this.applySearchAndPagination();
        }
      });
    this.getGradeDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getGradeDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.schoolManagementService.getGradeDetails().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        if (!Array.isArray(rows) && Number(response?.responseCode) !== 200) {
          this.errorMessage = response?.responseMessage || 'Unable to load grades.';
        }
        this.currentSkip = 0;
        this.applySearchAndPagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.fullData = [];
        this.applySearchAndPagination();
        this.errorMessage = error?.error?.responseMessage || 'Unable to load grades.';
        this.isLoading = false;
      }
    });
  }

  public searchData(value: string): void {
    this.searchDataValue = value;
    this.currentSkip = 0;
    this.applySearchAndPagination();
  }

  public openAddGrade(template: TemplateRef<any>): void {
    this.addGradeForm.reset({ gradeName: '', gradeCode: '' });
    this.addDialog = this.dialog.open(template, {
      width: '520px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public addGrade(): void {
    if (this.addGradeForm.invalid || this.isSaving) {
      this.addGradeForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.schoolManagementService.addGrade(this.addGradeForm.value).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.showMessage('Unable to add grade', payload?.respMesg || response?.responseMessage, 'error');
          return;
        }
        this.addDialog?.close();
        this.showMessage('Added', payload?.respMesg || 'Grade added successfully.', 'success');
        this.getGradeDetails();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.showMessage('Unable to add grade', error?.error?.responseMessage, 'error');
      }
    });
  }

  public openEditGrade(template: TemplateRef<any>, grade: any): void {
    this.editGradeForm.reset({
      id: grade.id,
      gradeName: grade.gradeName,
      gradeCode: grade.gradeCode
    });
    this.editDialog = this.dialog.open(template, {
      width: '520px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public updateGrade(): void {
    if (this.editGradeForm.invalid || this.isUpdating) {
      this.editGradeForm.markAllAsTouched();
      return;
    }
    this.isUpdating = true;
    this.schoolManagementService.updateGrade(this.editGradeForm.value).subscribe({
      next: (response: any) => {
        this.isUpdating = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.showMessage('Unable to update grade', payload?.respMesg || response?.responseMessage, 'error');
          return;
        }
        this.editDialog?.close();
        this.showMessage('Updated', payload?.respMesg || 'Grade updated successfully.', 'success');
        this.getGradeDetails();
      },
      error: (error: any) => {
        this.isUpdating = false;
        this.showMessage('Unable to update grade', error?.error?.responseMessage, 'error');
      }
    });
  }

  public sortData(sort: Sort): void {
    if (!sort.active || !sort.direction) return;
    const direction = sort.direction === 'asc' ? 1 : -1;
    this.fullData = [...this.fullData].sort((a, b) =>
      String(a?.[sort.active] ?? '').localeCompare(
        String(b?.[sort.active] ?? ''), undefined, { numeric: true, sensitivity: 'base' }
      ) * direction
    );
    this.applySearchAndPagination();
  }

  private applySearchAndPagination(): void {
    const term = this.searchDataValue.trim().toLowerCase();
    const filtered = term
      ? this.fullData.filter(item =>
          [item?.gradeName, item?.gradeCode, item?.status]
            .some(value => String(value ?? '').toLowerCase().includes(term)))
      : [...this.fullData];

    this.totalData = filtered.length;
    if (this.currentSkip >= this.totalData) this.currentSkip = 0;
    this.tableData = filtered.slice(this.currentSkip, this.currentSkip + this.pageSize);
    this.serialNumberArray = this.tableData.map((_, index) => this.currentSkip + index + 1);
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray
    });
  }

  private createForms(): void {
    const controls = {
      gradeName: ['', [Validators.required, Validators.maxLength(100)]],
      gradeCode: ['', [Validators.required, Validators.maxLength(50)]]
    };
    this.addGradeForm = this.fb.group(controls);
    this.editGradeForm = this.fb.group({
      id: [null, Validators.required],
      gradeName: ['', [Validators.required, Validators.maxLength(100)]],
      gradeCode: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  private showMessage(summary: string, detail: string, severity: 'success' | 'error'): void {
    this.messageService.add({
      summary,
      detail: detail || (severity === 'success' ? 'Operation completed successfully.' : 'Operation could not be completed.'),
      severity
    });
  }

}
