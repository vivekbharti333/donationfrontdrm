import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PaginationService } from 'src/app/shared/shared.index';
import { Audience, AudienceService } from './audience.service';

@Component({
  selector: 'app-audience',
  templateUrl: './audience.component.html',
  styleUrl: './audience.component.scss',
  providers: [MessageService, PaginationService],
})
export class AudienceComponent implements OnInit, OnDestroy {
  public tableData: Audience[] = [];
  public pageSize = 10;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  public searchDataValue = '';
  public isLoading = false;
  public errorMessage = '';
  public isSaving = false;
  public isUpdating = false;
  public isDeleting = false;
  public selectedAudience: Audience | null = null;
  public addAudienceForm = this.fb.nonNullable.group({
    audienceName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    description: [''],
  });
  public editAudienceForm = this.fb.nonNullable.group({
    id: [0, [Validators.required]],
    audienceName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    description: [''],
  });
  private addDialog?: MatDialogRef<unknown>;
  private editDialog?: MatDialogRef<unknown>;
  private deleteDialog?: MatDialogRef<unknown>;
  private audiences: Audience[] = [];
  private skip = 0;
  private sort: Sort = { active: '', direction: '' };
  private readonly destroy$ = new Subject<void>();

  constructor(
    private pagination: PaginationService,
    private messageService: MessageService,
    private audienceService: AudienceService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {}

  openAddModal(template: TemplateRef<unknown>): void {
    this.addAudienceForm.reset();
    this.addDialog = this.dialog.open(template, { width: '520px', maxWidth: '95vw' });
  }

  openEditModal(template: TemplateRef<unknown>, audience: Audience): void {
    this.selectedAudience = audience;
    this.editAudienceForm.patchValue({
      id: audience.id,
      audienceName: audience.audienceName ?? '',
      description: audience.description ?? '',
    });
    this.editDialog = this.dialog.open(template, { width: '520px', maxWidth: '95vw', disableClose: true });
  }

  updateAudience(): void {
    this.editAudienceForm.markAllAsTouched();
    if (this.editAudienceForm.invalid || this.isUpdating) return;

    const values = this.editAudienceForm.getRawValue();
    this.isUpdating = true;
    if (this.editDialog) this.editDialog.disableClose = true;

    this.audienceService.updateAudienceName({
      id: values.id,
      audienceName: values.audienceName.trim(),
      description: values.description.trim(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        this.isUpdating = false;
        if (this.editDialog) this.editDialog.disableClose = false;
        if (Number(response.responseCode) === 200 && Number(response.payload?.respCode) === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Audience updated',
            detail: response.payload?.respMesg || 'Audience updated successfully.',
          });
          this.editDialog?.close();
          this.editAudienceForm.reset();
          this.selectedAudience = null;
          this.getAudienceList();
          return;
        }
        this.showMutationError(response, 'Unable to update audience.');
      },
      error: () => {
        this.isUpdating = false;
        if (this.editDialog) this.editDialog.disableClose = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Update Audience',
          detail: 'Unable to update audience. Please try again.',
        });
      },
    });
  }

  openDeleteModal(template: TemplateRef<unknown>, audience: Audience): void {
    this.selectedAudience = audience;
    this.deleteDialog = this.dialog.open(template, { width: '450px', maxWidth: '95vw', disableClose: true });
  }

  deleteSelectedAudience(): void {
    if (!this.selectedAudience || this.isDeleting) return;
    this.isDeleting = true;
    if (this.deleteDialog) this.deleteDialog.disableClose = true;

    this.audienceService.deleteAudienceName(this.selectedAudience).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        this.isDeleting = false;
        if (this.deleteDialog) this.deleteDialog.disableClose = false;
        if (Number(response.responseCode) === 200 && Number(response.payload?.respCode) === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Audience deleted',
            detail: response.payload?.respMesg || 'Audience deleted successfully.',
          });
          this.deleteDialog?.close();
          this.selectedAudience = null;
          this.getAudienceList();
          return;
        }
        this.showMutationError(response, 'Unable to delete audience.');
      },
      error: () => {
        this.isDeleting = false;
        if (this.deleteDialog) this.deleteDialog.disableClose = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Delete Audience',
          detail: 'Unable to delete audience. Please try again.',
        });
      },
    });
  }

  addAudience(): void {
    this.addAudienceForm.markAllAsTouched();
    if (this.addAudienceForm.invalid || this.isSaving) return;
    const values = this.addAudienceForm.getRawValue();
    this.isSaving = true;
    if (this.addDialog) this.addDialog.disableClose = true;
    this.audienceService.addAudienceName(values.audienceName.trim(), values.description.trim())
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.isSaving = false;
          if (this.addDialog) this.addDialog.disableClose = false;
          if (response.responseCode !== 200 || response.payload?.respCode !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Add Audience',
              detail: response.payload?.respMesg || response.responseMessage || 'Unable to add audience.',
            });
            return;
          }
          this.addDialog?.close();
          this.messageService.add({ severity: 'success', summary: 'Audience added',
            detail: response.payload.respMesg });
          this.getAudienceList();
        },
        error: () => {
          this.isSaving = false;
          if (this.addDialog) this.addDialog.disableClose = false;
          this.messageService.add({ severity: 'error', summary: 'Add Audience',
            detail: 'Unable to add audience. Please try again.' });
        },
      });
  }

  ngOnInit(): void {
    this.pagination.tablePageSize.pipe(takeUntil(this.destroy$)).subscribe(page => {
      this.skip = page.skip;
      this.pageSize = page.pageSize;
      this.updateTable();
    });
    this.getAudienceList();
  }

  getAudienceList(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.audienceService.getAudienceList().pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        this.isLoading = false;
        if (response.responseCode !== 200 && response.responseCode !== 204) {
          this.showError(response.responseMessage || 'Unable to load audiences. Please try again.');
          return;
        }
        this.audiences = response.listPayload ?? [];
        this.resetPage();
      },
      error: () => {
        this.isLoading = false;
        this.showError('Unable to load audiences. Please try again.');
      },
    });
  }

  searchData(value: string): void {
    this.searchDataValue = value;
    this.resetPage();
  }

  sortData(sort: Sort): void {
    this.sort = sort;
    this.resetPage();
  }

  private resetPage(): void {
    this.skip = 0;
    this.updateTable();
    this.pagination.changePagesize.next({ pageSize: this.pageSize });
  }

  private updateTable(): void {
    const search = this.searchDataValue.trim().toLowerCase();
    const rows = this.audiences.filter(audience =>
      [audience.audienceName, audience.description, audience.status]
        .some(value => (value ?? '').toLowerCase().includes(search)),
    );
    const field = this.sort.active;
    if (this.sort.direction && (field === 'audienceName' || field === 'description' ||
      field === 'status' || field === 'createdAt')) {
      const direction = this.sort.direction === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        if (field === 'createdAt') {
          return ((a.createdAt ? new Date(a.createdAt).getTime() : 0) -
            (b.createdAt ? new Date(b.createdAt).getTime() : 0)) * direction;
        }
        return (a[field] ?? '').localeCompare(b[field] ?? '') * direction;
      });
    }
    this.totalData = rows.length;
    this.tableData = rows.slice(this.skip, this.skip + this.pageSize);
    this.serialNumberArray = this.tableData.map((_, index) => this.skip + index + 1);
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray,
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.audiences = [];
    this.resetPage();
    this.messageService.add({ severity: 'error', summary: 'Audience list', detail: message });
  }

  private showMutationError(response: any, fallback: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Audience',
      detail: response?.payload?.respMesg || response?.responseMessage || fallback,
    });
  }

  ngOnDestroy(): void {
    this.addDialog?.close();
    this.editDialog?.close();
    this.deleteDialog?.close();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
