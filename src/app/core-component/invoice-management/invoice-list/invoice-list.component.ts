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
  currentPage = 1;
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
    return this.invoices.filter(invoice =>
      [invoice.invoiceNumber, invoice.customerName, invoice.customerPhone]
        .some(value => (value || '').toLowerCase().includes(query)));
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
