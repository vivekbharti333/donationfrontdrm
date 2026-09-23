import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { InvoiceListEntry, InvoiceListService } from './invoice-list.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  invoices: InvoiceListEntry[] = [];
  isLoading = false;
  loadError = '';
  search = '';
  paymentFilter: 'ALL' | 'PAID' | 'UNPAID' = 'ALL';
  currentPage = 1;
  readonly pageSize = 10;
  private invoiceDialog?: MatDialogRef<unknown>;
  private readonly destroyed = new Subject<void>();

  constructor(private invoiceListService: InvoiceListService, private dialog: MatDialog) {}

  openInvoice(template: TemplateRef<unknown>, invoice: InvoiceListEntry): void {
    this.invoiceDialog?.close();
    this.invoiceDialog = this.dialog.open(template, {
      data: invoice,
      width: '960px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      ariaLabelledBy: 'invoice-dialog-title'
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  get filteredInvoices(): InvoiceListEntry[] {
    const query = this.search.trim().toLowerCase();
    return this.invoices.filter(invoice => {
      const matchesPayment = this.paymentFilter === 'ALL' ||
        (invoice.paymentStatus || '').toUpperCase() === this.paymentFilter;
      const matchesSearch = [invoice.invoiceNumber, invoice.customerName, invoice.customerPhone]
        .some(value => (value || '').toLowerCase().includes(query));
      return matchesPayment && matchesSearch;
    });
  }

  get pagedInvoices(): InvoiceListEntry[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredInvoices.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredInvoices.length / this.pageSize);
  }

  get paidCount(): number {
    return this.invoices.filter(invoice => (invoice.paymentStatus || '').toUpperCase() === 'PAID').length;
  }

  get unpaidCount(): number {
    return this.invoices.filter(invoice => (invoice.paymentStatus || '').toUpperCase() === 'UNPAID').length;
  }

  setPaymentFilter(filter: 'ALL' | 'PAID' | 'UNPAID'): void {
    this.paymentFilter = filter;
    this.currentPage = 1;
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  loadInvoices(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.loadError = '';
    this.invoices = [];
    this.currentPage = 1;
    this.invoiceListService.getInvoices().pipe(
      takeUntil(this.destroyed),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: response => {
        if (Number(response?.responseCode) === Constant.SUCCESS_CODE) {
          this.invoices = response.listPayload || [];
        } else if (Number(response?.responseCode) !== Constant.NO_CONTENT_CODE) {
          this.loadError = response?.responseMessage || 'Unable to load invoices.';
        }
      },
      error: error => {
        this.loadError = error.error?.responseMessage ||
          (error.status == null ? error.message : 'Unable to load invoices. Please try again.');
      }
    });
  }

  ngOnDestroy(): void {
    this.invoiceDialog?.close();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
