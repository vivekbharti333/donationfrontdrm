import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { SubjectService } from './subject.service';

@Component({
  selector: 'app-subject',
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.scss'
})
export class SubjectComponent implements OnInit, OnDestroy {
  public fullData: any[] = [];
  public tableData: any[] = [];
  public serialNumberArray: number[] = [];
  public totalData = 0;
  public pageSize = 10;
  public searchDataValue = '';
  public selectedStatus = '';
  public isLoading = false;
  public errorMessage = '';
  public addSubjectForm!: FormGroup;
  public editSubjectForm!: FormGroup;
  public isSaving = false;
  public isUpdating = false;

  private currentSkip = 0;
  private addDialog?: MatDialogRef<any>;
  private editDialog?: MatDialogRef<any>;
  private readonly destroy$ = new RxSubject<void>();

  constructor(
    private subjectService: SubjectService,
    private pagination: PaginationService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.addSubjectForm = this.fb.group({
      subjectCode: ['', [Validators.required, Validators.maxLength(30)]],
      subjectName: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      status: ['ACTIVE', Validators.required]
    });
    this.editSubjectForm = this.fb.group({
      id: [null, Validators.required],
      subjectCode: ['', [Validators.required, Validators.maxLength(30)]],
      subjectName: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      status: ['ACTIVE', Validators.required]
    });
    this.pagination.tablePageSize
      .pipe(takeUntil(this.destroy$))
      .subscribe((page: tablePageSize) => {
        if (this.router.url.includes('/subject')) {
          this.pageSize = page.pageSize;
          this.currentSkip = page.skip;
          this.applyPagination();
        }
      });
    this.getExamSubject();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getExamSubject(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.subjectService.getExamSubject({
      searchText: this.searchDataValue,
      status: this.selectedStatus
    }).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        if (!Array.isArray(rows) && Number(response?.responseCode) !== 200) {
          this.errorMessage = response?.responseMessage || 'Unable to load subjects.';
        }
        this.currentSkip = 0;
        this.applyPagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.fullData = [];
        this.applyPagination();
        this.errorMessage = error?.error?.responseMessage || 'Unable to load subjects.';
        this.isLoading = false;
      }
    });
  }

  public searchSubjects(): void {
    this.currentSkip = 0;
    this.getExamSubject();
  }

  public clearFilters(): void {
    this.searchDataValue = '';
    this.selectedStatus = '';
    this.getExamSubject();
  }

  public openAddSubject(template: TemplateRef<any>): void {
    this.addSubjectForm.reset({
      subjectCode: '',
      subjectName: '',
      description: '',
      status: 'ACTIVE'
    });
    this.addDialog = this.dialog.open(template, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public addExamSubject(): void {
    if (this.addSubjectForm.invalid || this.isSaving) {
      this.addSubjectForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.subjectService.addExamSubject(this.addSubjectForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.showMessage(
            'Unable to add subject',
            payload?.respMesg || response?.responseMessage || 'Subject could not be added.',
            'error'
          );
          return;
        }
        this.addDialog?.close();
        this.showMessage('Subject added', payload?.respMesg || 'Subject added successfully.', 'success');
        this.getExamSubject();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.showMessage(
          'Unable to add subject',
          error?.error?.responseMessage || 'Subject could not be added.',
          'error'
        );
      }
    });
  }

  public openEditSubject(template: TemplateRef<any>, subject: any): void {
    this.editSubjectForm.reset({
      id: subject?.id,
      subjectCode: subject?.subjectCode || '',
      subjectName: subject?.subjectName || '',
      description: subject?.description || '',
      status: subject?.status || 'ACTIVE'
    });
    this.editDialog = this.dialog.open(template, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public updateExamSubject(): void {
    if (this.editSubjectForm.invalid || this.isUpdating) {
      this.editSubjectForm.markAllAsTouched();
      return;
    }

    this.isUpdating = true;
    this.subjectService.updateExamSubject(this.editSubjectForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.isUpdating = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.showMessage(
            'Unable to update subject',
            payload?.respMesg || response?.responseMessage || 'Subject could not be updated.',
            'error'
          );
          return;
        }
        this.editDialog?.close();
        this.showMessage('Subject updated', payload?.respMesg || 'Subject updated successfully.', 'success');
        this.getExamSubject();
      },
      error: (error: any) => {
        this.isUpdating = false;
        this.showMessage(
          'Unable to update subject',
          error?.error?.responseMessage || 'Subject could not be updated.',
          'error'
        );
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
    this.applyPagination();
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
