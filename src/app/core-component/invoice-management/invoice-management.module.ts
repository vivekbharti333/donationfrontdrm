import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { InvoiceManagementComponent } from './invoice-management.component';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { InvoiceManagementRoutingModule } from './invoice-management-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import {NgxPaginationModule} from 'ngx-pagination';



@NgModule({
  declarations: [
    InvoiceManagementComponent,
    GenerateInvoiceComponent,
    InvoiceListComponent,
    CustomerDetailsComponent,
    ItemDetailsComponent
  ],
  imports: [
    InvoiceManagementRoutingModule,
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    CalendarModule,
    NgxPaginationModule
  ], providers: [MessageService],
})
export class InvoiceManagementModule { }
