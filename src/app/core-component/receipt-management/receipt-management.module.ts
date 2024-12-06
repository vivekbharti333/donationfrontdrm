import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { AddReceiptHeaderComponent } from './add-receipt-header/add-receipt-header.component'; 
import { ReceiptHeaderListComponent } from './receipt-header-list/receipt-header-list.component'; 
import { ReceiptManagementRoutingModule } from './receipt-management-routing.module'; 
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AddReceiptHeaderComponent,
    ReceiptHeaderListComponent,
  ],
  imports: [
    ReceiptManagementRoutingModule,
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule
  ]
})
export class ReceiptManagementModule { }
