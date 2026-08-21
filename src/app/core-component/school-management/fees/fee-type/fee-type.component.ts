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
  selector: 'app-fee-type',
  templateUrl: './fee-type.component.html',
  styleUrl: './fee-type.component.scss'
})
export class FeeTypeComponent implements OnInit, OnDestroy {
  public fullData: any[] = [];
  public tableData: any[] = [];
  public serialNumberArray: number[] = [];
  public totalData = 0;
  public pageSize = 10;
  public searchDataValue = '';
  public isLoading = false;
  public errorMessage = '';
  public addFeeTypeForm!: FormGroup;
  public editFeeTypeForm!: FormGroup;
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
    this.addFeeTypeForm = this.fb.group({
      feeTypeName: ['', [Validators.required, Validators.maxLength(100)]],
      feeTypeDescription: ['', Validators.maxLength(500)]
    });
    this.editFeeTypeForm = this.fb.group({
      id: [null, Validators.required],
      feeTypeName: ['', [Validators.required, Validators.maxLength(100)]],
      feeTypeDescription: ['', Validators.maxLength(500)]
    });
    this.pagination.tablePageSize
      .pipe(takeUntil(this.destroy$))
      .subscribe((page: tablePageSize) => {
        if (this.router.url.includes('fee-type')) {
          this.pageSize = page.pageSize;
          this.currentSkip = page.skip;
          this.applySearchAndPagination();
        }
      });
    this.getFeeTypeDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getFeeTypeDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.schoolManagementService.getFeeTypeDetails().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        if (!Array.isArray(rows) && Number(response?.responseCode) !== 200) {
          this.errorMessage = response?.responseMessage || 'Unable to load fee types.';
        }
        this.currentSkip = 0;
        this.applySearchAndPagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.fullData = [];
        this.applySearchAndPagination();
        this.errorMessage = error?.error?.responseMessage || 'Unable to load fee types.';
        this.isLoading = false;
      }
    });
  }

  public searchData(value: string): void {
    this.searchDataValue = value;
    this.currentSkip = 0;
    this.applySearchAndPagination();
  }

  public openAddFeeType(template: TemplateRef<any>): void {
    this.addFeeTypeForm.reset({ feeTypeName: '', feeTypeDescription: '' });
    this.addDialog = this.dialog.open(template, {
      width: '540px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public addFeeType(): void {
    if (this.addFeeTypeForm.invalid || this.isSaving) {
      this.addFeeTypeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.schoolManagementService.addFeeType(this.addFeeTypeForm.value).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.messageService.add({
            summary: 'Unable to add fee type',
            detail: payload?.respMesg || response?.responseMessage || 'Fee type could not be added.',
            severity: 'error'
          });
          return;
        }

        this.addDialog?.close();
        this.messageService.add({
          summary: 'Added',
          detail: payload?.respMesg || 'Fee type added successfully.',
          severity: 'success'
        });
        this.getFeeTypeDetails();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.messageService.add({
          summary: 'Unable to add fee type',
          detail: error?.error?.responseMessage || 'Fee type could not be added.',
          severity: 'error'
        });
      }
    });
  }

  public openEditFeeType(template: TemplateRef<any>, feeType: any): void {
    this.editFeeTypeForm.reset({
      id: feeType.id,
      feeTypeName: feeType.feeTypeName,
      feeTypeDescription: feeType.feeTypeDescription || ''
    });
    this.editDialog = this.dialog.open(template, {
      width: '540px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  public updateFeeType(): void {
    if (this.editFeeTypeForm.invalid || this.isUpdating) {
      this.editFeeTypeForm.markAllAsTouched();
      return;
    }

    this.isUpdating = true;
    this.schoolManagementService.updateFeeType(this.editFeeTypeForm.value).subscribe({
      next: (response: any) => {
        this.isUpdating = false;
        const payload = response?.payload;
        if (Number(response?.responseCode) !== 200 || Number(payload?.respCode) !== 200) {
          this.messageService.add({
            summary: 'Unable to update fee type',
            detail: payload?.respMesg || response?.responseMessage || 'Fee type could not be updated.',
            severity: 'error'
          });
          return;
        }

        this.editDialog?.close();
        this.messageService.add({
          summary: 'Updated',
          detail: payload?.respMesg || 'Fee type updated successfully.',
          severity: 'success'
        });
        this.getFeeTypeDetails();
      },
      error: (error: any) => {
        this.isUpdating = false;
        this.messageService.add({
          summary: 'Unable to update fee type',
          detail: error?.error?.responseMessage || 'Fee type could not be updated.',
          severity: 'error'
        });
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
          [item?.feeTypeName, item?.feeTypeDescription, item?.status, item?.createdBy]
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

}
