import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InvoiceManagementComponent } from './invoice-management.component';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { ItemDetailsComponent } from './item-details/item-details.component';

const routes: Routes = [
  {
    path: '',
    component: InvoiceManagementComponent,
    children: [
      {
        path: 'generate-invoice',
        component: GenerateInvoiceComponent,
      },
      {
        path: 'invoice-list',
        component: InvoiceListComponent,
      },
      {
        path: 'customer-details',
        component: CustomerDetailsComponent,
      },
      {
        path: 'item-details',
        component: ItemDetailsComponent,
      },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceManagementRoutingModule { }
