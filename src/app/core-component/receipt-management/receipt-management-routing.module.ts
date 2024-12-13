import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceiptManagementComponent } from './receipt-management.component';
import { AddReceiptHeaderComponent } from './add-receipt-header/add-receipt-header.component'; 
import { ReceiptHeaderListComponent } from './receipt-header-list/receipt-header-list.component'; 
import { DownloadReceiptComponent } from './download-receipt/download-receipt.component';



const routes: Routes = [
  {
    path: '',
    component: ReceiptManagementComponent,
    children: [
      {
        path: 'add-receipt-header',
        component: AddReceiptHeaderComponent,
      },
      {
        path: 'receipt-header-list',
        component: ReceiptHeaderListComponent,
      },
      {
        path: 'receipt',
        component: DownloadReceiptComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceiptManagementRoutingModule { }
