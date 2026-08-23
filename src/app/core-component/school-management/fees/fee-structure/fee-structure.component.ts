import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';

@Component({
  selector: 'app-fee-structure',
  templateUrl: './fee-structure.component.html',
  styleUrl: './fee-structure.component.scss'
})
export class FeeStructureComponent implements OnInit, OnDestroy {
  public fullData: any[] = [];
  public tableData: any[] = [];
  public serialNumberArray: number[] = [];
  public totalData = 0;
  public pageSize = 10;
  public searchDataValue = '';
  public selectedAcademicYear = 'All Years';
  public selectedGrade: number | null = null;
  public selectedStatus = 'All Statuses';
  public selectedFeeStructure: any = null;
  public isLoading = false;
  public errorMessage = '';
  public feeTypes: any[] = [];
  public gradeOptions: any[] = [];
  public isFeeTypesLoading = false;
  public isGradesLoading = false;
  public readonly feeFrequencyOptions = Constant.FEE_FREQUENCY_OPTIONS;
  public readonly academicYearOptions = Constant.ACADEMIC_YEAR_OPTIONS;
  public addFeeStructureForm!: FormGroup;
  public editFeeStructureForm!: FormGroup;
  public isSaving = false;
  public isUpdating = false;
  public isDeleting = false;

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
        if (this.router.url.includes('fee-structure')) {
          this.pageSize = page.pageSize;
          this.currentSkip = page.skip;
          this.applySearchAndPagination();
        }
      });
    this.getFeeStructure();
    this.getFeeTypeDetails();
    this.getGradeDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getFeeStructure(useFilters = false): void {
    this.isLoading = true;
    this.errorMessage = '';
    const filters = useFilters ? {
      academicYearId: this.selectedAcademicYear === 'All Years' ? undefined : this.selectedAcademicYear,
      gradeId: this.selectedGrade,
      feeTypeName: this.searchDataValue.replace(/\s+fee structure$/i, '').trim()
    } : undefined;
    this.schoolManagementService.getFeeStructure(filters).subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.fullData = Array.isArray(rows) ? rows : [];
        if (!Array.isArray(rows) && Number(response?.responseCode) !== 200) {
          this.errorMessage = response?.responseMessage || 'Unable to load fee structures.';
        }
        this.currentSkip = 0;
        this.applySearchAndPagination();
        this.selectedFeeStructure = this.tableData[0] || this.fullData[0] || null;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.fullData = [];
        this.applySearchAndPagination();
        this.errorMessage = error?.error?.responseMessage || 'Unable to load fee structures.';
        this.isLoading = false;
      }
    });
  }

  public getFeeTypeDetails(): void {
    this.isFeeTypesLoading = true;
    this.schoolManagementService.getFeeTypeDetails().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.feeTypes = Array.isArray(rows) ? rows : [];
        this.isFeeTypesLoading = false;
      },
      error: () => {
        this.feeTypes = [];
        this.isFeeTypesLoading = false;
      }
    });
  }

  public getGradeDetails(): void {
    this.isGradesLoading = true;
    this.schoolManagementService.getGradeDetails().subscribe({
      next: (response: any) => {
        const rows = response?.listPayload ?? response?.payload ?? response?.data;
        this.gradeOptions = Array.isArray(rows) ? rows : [];
        this.isGradesLoading = false;
      },
      error: () => {
        this.gradeOptions = [];
        this.isGradesLoading = false;
      }
    });
  }

  public searchData(value: string): void {
    this.searchDataValue = value;
    this.currentSkip = 0;
    this.applySearchAndPagination();
  }

  public applyFilters(): void {
    this.currentSkip = 0;
    this.getFeeStructure(true);
  }

  public resetFilters(): void {
    this.selectedAcademicYear = 'All Years';
    this.selectedGrade = null;
    this.selectedStatus = 'All Statuses';
    this.searchDataValue = '';
    this.getFeeStructure();
  }

  public selectFeeStructure(item: any): void {
    this.selectedFeeStructure = item;
  }

  public get academicYears(): string[] {
    return [...new Set(this.fullData.map(item => String(item?.academicYearId || '')).filter(Boolean))];
  }

  public get grades(): string[] {
    return [...new Set(this.fullData.map(item => String(item?.gradeName || item?.className || item?.gradeId || '')).filter(Boolean))];
  }

  public get totalAmount(): number {
    return this.fullData.reduce((total, item) => total + Number(item?.amount || 0), 0);
  }

  public get activeCount(): number {
    return this.fullData.filter(item => this.isActive(item)).length;
  }

  public get inactiveCount(): number {
    return this.fullData.length - this.activeCount;
  }

  public getStructureName(item: any): string {
    return item?.feeStructureName || item?.structureName || `${this.getFeeTypeName(item?.feeTypeId)} Fee Structure`;
  }

  public getGradeName(item: any): string {
    const grade = this.gradeOptions.find(option => String(option?.id) === String(item?.gradeId));
    return item?.gradeName || item?.className || grade?.gradeName || grade?.name
      || (item?.gradeId ? `Class ${item.gradeId}` : '—');
  }

  public isActive(item: any): boolean {
    const status = String(item?.status ?? 'ACTIVE').toUpperCase();
    return status === 'ACTIVE' || status === '1' || status === 'TRUE';
  }

  public openAddFeeStructure(template: TemplateRef<any>): void {
    this.addFeeStructureForm.reset({
      academicYearId: '2026-27', gradeId: null
    });
    this.addFeeStructureForm.setControl('feeStructures', this.fb.array([this.createFeeRow()]));
    this.addDialog = this.openDialog(template);
  }

  public get feeStructureRows(): FormArray {
    return this.addFeeStructureForm.get('feeStructures') as FormArray;
  }

  public addFeeRow(): void {
    this.feeStructureRows.push(this.createFeeRow());
  }

  public removeFeeRow(index: number): void {
    if (this.feeStructureRows.length > 1) this.feeStructureRows.removeAt(index);
  }

  public addFeeStructure(): void {
    if (this.isSaving) return;
    if (this.addFeeStructureForm.invalid || this.feeStructureRows.length === 0) {
      this.addFeeStructureForm.markAllAsTouched();
      this.showMessage('Required fields', 'Complete academic year, grade, and every fee row.', 'error');
      return;
    }
    this.isSaving = true;
    this.schoolManagementService.addFeeStructure(this.addFeeStructureForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (!this.isSuccess(response)) {
          this.showMessage('Unable to add fee structure', this.getResponseMessage(response), 'error');
          return;
        }
        this.addDialog?.close();
        this.showMessage('Added', this.getResponseMessage(response) || 'Fee structure added successfully.', 'success');
        this.getFeeStructure();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.showMessage('Unable to add fee structure', error?.error?.responseMessage, 'error');
      }
    });
  }

  public openEditFeeStructure(template: TemplateRef<any>, item: any): void {
    this.editFeeStructureForm.reset({
      id: item.id,
      academicYearId: item.academicYearId,
      gradeId: item.gradeId,
      feeTypeId: item.feeTypeId,
      amount: item.amount,
      frequency: item.frequency || ''
    });
    this.editDialog = this.openDialog(template);
  }

  public updateFeeStructure(): void {
    if (this.isUpdating) return;
    if (!this.hasValidFeeStructureValues(this.editFeeStructureForm)) {
      this.editFeeStructureForm.markAllAsTouched();
      this.showMessage('Required fields', 'Please complete all required fee structure fields.', 'error');
      return;
    }
    this.isUpdating = true;
    this.schoolManagementService.updateFeeStructure(this.editFeeStructureForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.isUpdating = false;
        if (!this.isSuccess(response)) {
          this.showMessage('Unable to update fee structure', this.getResponseMessage(response), 'error');
          return;
        }
        this.editDialog?.close();
        this.showMessage('Updated', this.getResponseMessage(response) || 'Fee structure updated successfully.', 'success');
        this.getFeeStructure();
      },
      error: (error: any) => {
        this.isUpdating = false;
        this.showMessage('Unable to update fee structure', error?.error?.responseMessage, 'error');
      }
    });
  }

  public deleteFeeStructure(item: any): void {
    if (this.isDeleting || !item?.id || !window.confirm(`Delete ${this.getStructureName(item)}?`)) return;
    this.isDeleting = true;
    this.schoolManagementService.deleteFeeStructure(item.id).subscribe({
      next: (response: any) => {
        this.isDeleting = false;
        if (!this.isSuccess(response)) {
          this.showMessage('Unable to delete fee structure', this.getResponseMessage(response), 'error');
          return;
        }
        this.showMessage('Deleted', this.getResponseMessage(response) || 'Fee structure deleted successfully.', 'success');
        this.getFeeStructure();
      },
      error: (error: any) => {
        this.isDeleting = false;
        this.showMessage('Unable to delete fee structure', error?.error?.responseMessage, 'error');
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

  public getFeeTypeName(feeTypeId: number | string): string {
    const feeType = this.feeTypes.find(item => String(item?.id) === String(feeTypeId));
    return feeType?.feeTypeName || String(feeTypeId || '—');
  }

  private createForms(): void {
    this.addFeeStructureForm = this.fb.group({
      academicYearId: ['', Validators.required],
      gradeId: [null, [Validators.required, Validators.min(1)]],
      feeStructures: this.fb.array([this.createFeeRow()])
    });
    this.editFeeStructureForm = this.fb.group({
      id: [null, Validators.required],
      academicYearId: ['', Validators.required],
      gradeId: [null, [Validators.required, Validators.min(1)]],
      feeTypeId: [null, [Validators.required, Validators.min(1)]],
      amount: [null, [Validators.required, Validators.min(0)]],
      frequency: ['', Validators.maxLength(50)]
    });
  }

  private createFeeRow(): FormGroup {
    return this.fb.group({
      feeTypeId: [null, [Validators.required, Validators.min(1)]],
      amount: [null, [Validators.required, Validators.min(0)]],
      frequency: ['', Validators.required]
    });
  }

  private openDialog(template: TemplateRef<any>): MatDialogRef<any> {
    return this.dialog.open(template, {
      width: '900px', maxWidth: '95vw', disableClose: true, panelClass: 'custom-modal'
    });
  }

  private applySearchAndPagination(): void {
    const term = this.searchDataValue.trim().toLowerCase();
    const filtered = this.fullData.filter(item => {
      const matchesTerm = !term
        || this.getStructureName(item).toLowerCase().includes(term)
        || this.getFeeTypeName(item?.feeTypeId).toLowerCase().includes(term);
      const matchesYear = this.selectedAcademicYear === 'All Years'
        || String(item?.academicYearId ?? '') === this.selectedAcademicYear;
      const matchesGrade = this.selectedGrade == null
        || String(item?.gradeId ?? '') === String(this.selectedGrade);
      const matchesStatus = this.selectedStatus === 'All Statuses'
        || (this.selectedStatus === 'Active' ? this.isActive(item) : !this.isActive(item));
      return matchesTerm && matchesYear && matchesGrade && matchesStatus;
    });
    this.totalData = filtered.length;
    if (this.currentSkip >= this.totalData) this.currentSkip = 0;
    this.tableData = filtered.slice(this.currentSkip, this.currentSkip + this.pageSize);
    this.serialNumberArray = this.tableData.map((_, index) => this.currentSkip + index + 1);
    this.pagination.calculatePageSize.next({
      totalData: this.totalData, pageSize: this.pageSize,
      tableData: this.tableData, serialNumberArray: this.serialNumberArray
    });
  }

  private isSuccess(response: any): boolean {
    return Number(response?.responseCode) === 200 && Number(response?.payload?.respCode) === 200;
  }

  private getResponseMessage(response: any): string {
    return response?.payload?.respMesg || response?.responseMessage || '';
  }

  private hasValidFeeStructureValues(form: FormGroup): boolean {
    const value = form.getRawValue();
    return String(value.academicYearId ?? '').trim().length > 0
      && Number(value.gradeId) > 0
      && Number(value.feeTypeId) > 0
      && value.amount !== null
      && value.amount !== ''
      && Number(value.amount) >= 0;
  }

  private showMessage(summary: string, detail: string, severity: 'success' | 'error'): void {
    this.messageService.add({
      summary,
      detail: detail || (severity === 'success' ? 'Operation completed successfully.' : 'Operation could not be completed.'),
      severity
    });
  }

}
