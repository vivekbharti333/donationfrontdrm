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
  public addAudienceForm = this.fb.nonNullable.group({
    audienceName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    description: [''],
  });
  private addDialog?: MatDialogRef<unknown>;
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

  ngOnDestroy(): void {
    this.addDialog?.close();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
