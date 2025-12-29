import { Component, importProvidersFrom, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';

import { MatTabsModule } from '@angular/material/tabs';
import { PaymentModeManagementService } from '../payment-mode-management.service';

interface PaymentMode {
  id: number;
  paymentMode: string;
  status: string;
  createdAt: number;
}

@Component({
  selector: 'app-payment-mode',
  templateUrl: './payment-mode.component.html',
  styleUrl: './payment-mode.component.scss'
})
export class PaymentModeComponent {

  public masterPaymentModeList: any;
  public selectedIds: number[] = [];
  // public paymentModeList:  any;
  public paymentModeList: any[] = [];


  constructor(
      private pagination: PaginationService,
      private router: Router,
      private sidebar: SidebarService,
      // private messageService: MessageService,
      private paymentModeManagementService: PaymentModeManagementService,

    ) {}
  
    ngOnInit() {
      this.getMasterPaymentModeList();
      this.getPaymentModeListBySuperadminId();
      this.initializeSelectedIds();
    }

  
    initializeSelectedIds(): void {
      this.selectedIds = [...this.paymentModeList];
    }
  
    isChecked(id: number): boolean {
      return this.selectedIds.includes(id);
    }

    toggleSelection(id: number): void {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((selectedId) => selectedId !== id);
      } else {
        this.selectedIds.push(id);
      }
      console.log("1 : "+this.selectedIds);

      this.selectedIds.join(',')

      this.addUpdatePaymentMode(this.selectedIds.join(','));
    }

  updateSelectedIds(data: any): void {
    if (data.checked) {
      // Add the ID if checked
      this.selectedIds.push(data.id);
    } else {
      // Remove the ID if unchecked
      this.selectedIds = this.selectedIds.filter(id => id !== data.id);
    }
    
     // Log or process the selected IDs
    
  }

  public getMasterPaymentModeList() {
    this.paymentModeManagementService.getMasterPaymentModeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.masterPaymentModeList = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
     
    });
  }

  public getPaymentModeListBySuperadminId() {
    this.paymentModeManagementService.getPaymentModeListBySuperadminId().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.paymentModeList = JSON.parse(JSON.stringify(response.listPayload));
          
          // Explicitly define the item type as PaymentMode
          const ids = this.paymentModeList.map((item: PaymentMode) => item.id);
          this.selectedIds = ids;  // Log the array of ids for testing
         
        }
      },
      error: (error) => {
        console.error('Error fetching payment mode list:', error);
      }
    });
  }
  

  addUpdatePaymentMode(paymentModeIds:any) {
    console.log("Updated ")
    this.paymentModeManagementService.addUpdatePaymentModeBySuperadmin(paymentModeIds).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            // form.reset();
            // this.messageService.add({
            //   summary: response['payload']['respCode'],
            //   detail: response['payload']['respMesg'],
            //   styleClass: 'success-background-popover',
            // });
          } else {
            // this.messageService.add({
            //   summary: response['payload']['respCode'],
            //   detail: response['payload']['respMesg'],
            //   styleClass: 'danger-background-popover',
            // });
          }
        } else {
          // this.messageService.add({
          //   summary: response['payload']['respCode'],
          //   detail: response['payload']['respMesg'],
          //   styleClass: 'danger-background-popover',
          // });
        }
      },
      // error: () =>
      //   this.messageService.add({
      //     summary: '500',
      //     detail: 'Server Error',
      //   }),
    });
  }


}
