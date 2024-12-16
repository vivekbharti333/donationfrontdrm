import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { sharedModule } from 'src/app/shared/shared.module';
import { ReceiptManagementRoutingModule } from './receipt-management-routing.module'; 
import { ReceiptManagementComponent } from './receipt-management.component';
import { AddReceiptHeaderComponent } from './add-receipt-header/add-receipt-header.component'; 
import { ReceiptHeaderListComponent } from './receipt-header-list/receipt-header-list.component'; 
import { DownloadReceiptComponent } from './download-receipt/download-receipt.component';

@NgModule({
  declarations: [
    ReceiptManagementComponent ,
    AddReceiptHeaderComponent,
    ReceiptHeaderListComponent,
    DownloadReceiptComponent
  ],
  imports: [
    ReceiptManagementRoutingModule,
    CommonModule,
    sharedModule,]
})
export class ReceiptManagementModule { }

