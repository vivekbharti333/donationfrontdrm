import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReceiptManagementRoutingModule } from './receipt-management-routing.module'; 
import { ReceiptManagementComponent } from './receipt-management.component';
import { AddReceiptHeaderComponent } from './add-receipt-header/add-receipt-header.component'; 
import { ReceiptHeaderListComponent } from './receipt-header-list/receipt-header-list.component'; 
import { DownloadReceiptComponent } from './download-receipt/download-receipt.component';
import { sharedModule } from 'src/app/shared/shared.module';

import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  declarations: [
    ReceiptManagementComponent ,
    AddReceiptHeaderComponent,
    ReceiptHeaderListComponent,
    DownloadReceiptComponent
  ],
  imports: [
    CommonModule,
    ReceiptManagementRoutingModule,
    sharedModule,
    NgxEditorModule
  ]
})
export class ReceiptManagementModule { }

