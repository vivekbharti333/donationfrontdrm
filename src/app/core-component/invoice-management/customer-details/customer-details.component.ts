import { Component, TemplateRef, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CustomerDetailsService } from './customer-details.service';

interface Customer {
  id: number;
  companyId: number;
  customerName: string;
  phone: string;
  email: string;
  gstNumber: string;
  billingAddress: string;
  deliveryAddresses: string;
  createdAt: number;
}

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  companies: any[] = [];
  isSaving = false;
  loadingCompanies = false;
  formError = '';
  editingCustomer: Customer | null = null;
  private dialogRef?: MatDialogRef<unknown>;

  openAddCustomer(template: TemplateRef<unknown>, customer: Customer | null = null): void {
    this.editingCustomer = customer;
    this.customerForm = this.fb.group({
      companyId: ['', Validators.required],
      customerName: ['', [Validators.required, Validators.pattern(/\S/)]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ()-]{7,20}$/)]],
      customerEmail: ['', Validators.email],
      gstNumber: ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i)],
      billingAddress: ['', [Validators.required, Validators.pattern(/\S/)]],
      deliveryAddresses: ['']
    });
    if (customer) {
      this.customerForm.patchValue({
        companyId: customer.companyId,
        customerName: customer.customerName || '',
        customerPhone: customer.phone || '',
        customerEmail: customer.email || '',
        gstNumber: customer.gstNumber || '',
        billingAddress: customer.billingAddress || '',
        deliveryAddresses: customer.deliveryAddresses || ''
      });
    }
    this.formError = '';
    this.companies = [];
    this.dialogRef = this.dialog.open(template, { width: '720px', maxWidth: '95vw', disableClose: true, ariaLabelledBy: 'add-customer-title' });
    this.loadingCompanies = true;
    this.customerDetailsService.getCompanies().pipe(takeUntil(this.destroyed), finalize(() => this.loadingCompanies = false)).subscribe({
      next: res => {
        this.companies = res.listPayload || [];
        if (customer?.companyId && !this.companies.some(company => Number(company.id) === Number(customer.companyId))) {
          this.companies.push({ id: customer.companyId, companyFirstName: `Company #${customer.companyId}`, companyLastName: '' });
        }
        if (!this.companies.length) this.formError = Number(res.responseCode) === 204 ? 'Please add a company before adding a customer.' : (res.responseMessage || 'No companies available.');
      },
      error: () => this.formError = 'Unable to load companies. Close and reopen to try again.'
    });
  }

  closeAddCustomer(): void {
    if (!this.isSaving) this.dialogRef?.close();
  }

  saveCustomer(): void {
    // The backend currently exposes no update endpoint. Never create a new record from edit mode.
    if (this.editingCustomer) return;
    if (this.isSaving || this.loadingCompanies || !this.companies.length) return;
    const customer = this.customerForm.getRawValue();
    Object.keys(customer).forEach(key => {
      if (typeof customer[key] === 'string') customer[key] = customer[key].trim();
    });
    customer.customerName = customer.customerName.toUpperCase();
    customer.gstNumber = customer.gstNumber.toUpperCase();
    this.customerForm.patchValue(customer);
    this.customerForm.markAllAsTouched();
    if (this.customerForm.invalid) return;
    this.formError = '';
    this.isSaving = true;
    this.customerDetailsService.addCustomerDetails(customer).pipe(takeUntil(this.destroyed), finalize(() => this.isSaving = false)).subscribe({
      next: res => {
        if (Number(res.responseCode) === 200 && Number(res.payload?.respCode) === 200) {
          this.dialogRef?.close();
          this.messageService.add({ severity: 'success', summary: 'Customer added', detail: res.payload.respMesg || 'Customer saved successfully.' });
          this.searchDataValue = '';
          this.getCustomerDetails();
        } else {
          this.formError = res.payload?.respMesg || res.responseMessage || 'Unable to save customer.';
        }
      },
      error: err => this.formError = err.error?.responseMessage || 'Unable to save customer. Please try again.'
    });
  }

  invalid(field: string): boolean {
    const control = this.customerForm.get(field);
    return !!control && control.touched && control.invalid;
  }


  fullData: Customer[] = [];
  filteredData: Customer[] = [];
  tableData: Customer[] = [];
  searchDataValue = '';
  pageSize = 10;
  currentPage = 1;
  isLoading = false;
  loadError = '';
  private sort: Sort = { active: 'createdAt', direction: 'desc' };
  private destroyed = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private customerDetailsService: CustomerDetailsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.getCustomerDetails(); }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
    this.dialogRef?.close();
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize)); }
  get firstRecord(): number { return this.filteredData.length ? (this.currentPage - 1) * this.pageSize + 1 : 0; }
  get lastRecord(): number { return Math.min(this.currentPage * this.pageSize, this.filteredData.length); }
  get gstCustomers(): number { return this.fullData.filter(customer => !!customer.gstNumber).length; }

  getCustomerDetails(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.loadError = '';
    this.customerDetailsService.getCustomerDetails().pipe(takeUntil(this.destroyed), finalize(() => this.isLoading = false)).subscribe({
      next: res => {
        if (![200, 204].includes(Number(res.responseCode))) {
          this.loadError = res.responseMessage || 'Unable to load customers.';
          return;
        }
        this.fullData = res.listPayload || [];
        this.searchData(this.searchDataValue);
      },
      error: () => this.loadError = 'Unable to load customers. Please check your connection and try again.'
    });
  }

  searchData(value: string): void {
    this.searchDataValue = value;
    const term = value.trim().toLowerCase();
    this.filteredData = this.fullData.filter(customer =>
      [customer.customerName, customer.phone, customer.email, customer.gstNumber, customer.billingAddress, customer.deliveryAddresses]
        .some(field => String(field || '').toLowerCase().includes(term))
    );
    const { active, direction } = this.sort;
    if (direction) {
      this.filteredData.sort((a, b) => {
        const left = a[active as keyof Customer];
        const right = b[active as keyof Customer];
        const comparison = active === 'createdAt' ? Number(left || 0) - Number(right || 0) : String(left || '').localeCompare(String(right || ''), undefined, { numeric: true });
        return comparison * (direction === 'asc' ? 1 : -1);
      });
    }
    this.currentPage = 1;
    this.updatePage();
  }

  sortData(sort: Sort): void { this.sort = sort; this.searchData(this.searchDataValue); }
  changePage(page: number): void { this.currentPage = Math.min(this.totalPages, Math.max(1, page)); this.updatePage(); }
  changePageSize(size: number): void { this.pageSize = Number(size); this.changePage(1); }
  private updatePage(): void { this.tableData = this.filteredData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  initials(name: string): string { return (name || '?').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(); }
}
