import { Component, importProvidersFrom, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/service/helper.service';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';

import { MatTabsModule } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { DatePipe } from '@angular/common';
import { DonationDetails } from 'src/app/core-component/interface/donation-management'; 
import { PaymentModeManagementService } from '../payment-mode-management.service';

@Component({
  selector: 'app-payment-mode-master',
  templateUrl: './payment-mode-master.component.html',
  styleUrl: './payment-mode-master.component.scss'
})
export class PaymentModeMasterComponent {

  public masterPaymentModeList: any;
  public addPaymentModeDialog: any;
  public editPaymentModeDialog: any;
  public paymentModeForm!: FormGroup;

   // pagination variables
   public routes = routes;
   public tableData: Array<any> = [];
   public categoryTypeList: Array<any> = [];
   public superCategoryList: Array<any> = [];
   public categoryList: Array<any> = [];
   public subCategoryList: Array<any> = [];
   public pageSize = 10;
   public serialNumberArray: Array<number> = [];
   public totalData = 0;
   showFilter = false;
   dataSource!: MatTableDataSource<DonationDetails>;
   public searchDataValue = '';
   roleType: string = '';
   //** / pagination variables


   constructor(
      private data: DataService,
      private fb: FormBuilder,
      private pagination: PaginationService,
      private router: Router,
      private sidebar: SidebarService,
      // private messageService: MessageService,
      private dialog: MatDialog,
      private helper: HelperService,
      private paymentModeManagementService: PaymentModeManagementService,
      private cookieService: CookieService,
      private datePipe: DatePipe
    ) {}
  
    ngOnInit() {
      this.getMasterPaymentModeList();
      // this.getUserListForDropDown();
      
    }


    getMasterPaymentModeList() {
      this.paymentModeManagementService.getMasterPaymentModeList().subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.paymentModeMaster) {
            this.getTableData({ skip: res.skip, limit: (res.skip)+ this.pageSize });
            this.pageSize = res.pageSize;
          }
        });
      });
    }
  
     private getTableData(pageOption: pageSelection): void {
      this.paymentModeManagementService.getMasterPaymentModeList().subscribe((apiRes: any) => {
          this.masterPaymentModeList = apiRes.listPayload;
          this.tableData = [];
          this.serialNumberArray = [];
          this.totalData = apiRes.totalNumber;
          apiRes.listPayload.map((res: DonationDetails, index: number) => {
            const serialNumber = index + 1;
            if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
              this.tableData.push(res);
              this.serialNumberArray.push(serialNumber);
            }
          });
          this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);
          this.pagination.calculatePageSize.next({
            totalData: this.totalData,
            pageSize: this.pageSize,
            tableData: this.tableData,
            serialNumberArray: this.serialNumberArray,
          });
        });
      }
  
    public sortData(sort: Sort) {
      const data = this.tableData.slice();
      if (!sort.active || sort.direction === '') {
        this.tableData = data;
      } else {
        this.tableData = data.sort((a, b) => {
          const aValue = (a as never)[sort.active];
          const bValue = (b as never)[sort.active];
          return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
        });
      }
    }

    public searchData(value: string): void {
      this.dataSource.filter = value.trim().toLowerCase();
      this.tableData = this.dataSource.filteredData;
    }

    changeUserStatus(nay:any){

    }

     createForms() {
        this.paymentModeForm = this.fb.group({
          id: [''],
          paymentMode: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')]],

        });
      }

    openAddModal(templateRef: TemplateRef<any>) {
      (this.addPaymentModeDialog = this.dialog.open(templateRef)),
        {
          width: '1400px', // Set your desired width
          // height: '600px', // Set your desired height
          disableClose: true, // Optional: prevent closing by clicking outside
          panelClass: 'custom-modal', // Optional: add custom class for additional styling
        };
    }


    submitPaymentModeMasterForm(){

    }

    

}
