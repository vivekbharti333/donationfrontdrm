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
import { CurrencyMasterService } from './currency-master.service';

import { MatTabsModule } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { DatePipe } from '@angular/common';
import { DonationDetails } from 'src/app/core-component/interface/donation-management';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-currency-master',
  templateUrl: './currency-master.component.html',
  styleUrl: './currency-master.component.scss',
  providers: [DatePipe, MessageService],
})
export class CurrencyMasterComponent {

  public masterPaymentModeList: any;
  public addPaymentModeDialog: any;
  public editPaymentModeDialog: any;
  public currencyMasterForm!: FormGroup;
  public updateCurrencyMasterForm!: FormGroup;
  dialogRef!: MatDialogRef<any>;
  isEditMode = false;

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
  dataSource!: MatTableDataSource<CurrencyMasterComponent>;
  public searchDataValue = '';
  roleType: string = '';
  //** / pagination variables


  constructor(
    private data: DataService,
    private fb: FormBuilder,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private helper: HelperService,
    private currencyMasterService: CurrencyMasterService,
    private cookieService: CookieService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.getCurrencyMasterList();
    this.createForms();

  }

  createForms() {
  this.currencyMasterForm = this.fb.group({
    id: [''],
    country: [''],
    currencyName: [''],
    currencyCode: [''],
    unicode: [''],
    hexCode: [''],
    htmlCode: [''],
    cssCode: [''],
  });
  this.updateCurrencyMasterForm = this.fb.group({
    id: [''],
    country: [''],
    currencyName: [''],
    currencyCode: [''],
    unicode: [''],
    hexCode: [''],
    htmlCode: [''],
    cssCode: [''],
  });
}

  getCurrencyMasterList() {
    this.currencyMasterService.getCurrencyMasterList().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.currencyMaster) {
          this.getTableData({ skip: res.skip, limit: (res.skip) + this.pageSize });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  private getTableData(pageOption: pageSelection): void {
  this.currencyMasterService.getCurrencyMasterList().subscribe((apiRes: any) => {

    this.tableData = [];
    this.serialNumberArray = [];
    this.totalData = apiRes.totalNumber;

    apiRes.listPayload.forEach((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        this.tableData.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });

    this.dataSource = new MatTableDataSource<any>(this.tableData);

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



openAddModal(templateRef: TemplateRef<any>): void {
  this.dialogRef = this.dialog.open(templateRef, {
    width: '1400px',
    disableClose: true,
    panelClass: 'custom-modal',
  });
}

openEditModal(templateRef: TemplateRef<any>, rowData: any): void {
  this.isEditMode = true;

  this.updateCurrencyMasterForm.patchValue({
    id: rowData.id,
    country: rowData.country,
    currencyName: rowData.currencyName,
    currencyCode: rowData.currencyCode,
    unicode: rowData.unicode,
    hexCode: rowData.hexCode,
    htmlCode: rowData.htmlCode,
    cssCode: rowData.cssCode,
  });

  this.dialogRef = this.dialog.open(templateRef, {
    width: '1400px',
    disableClose: true,
    panelClass: 'custom-modal',
  });
}


public updateCurrencyMaster(): void {

  if (this.currencyMasterForm.invalid) {
    this.currencyMasterForm.markAllAsTouched();
    return;
  }

  this.currencyMasterService
    .updateCurrencyMasterForm(this.updateCurrencyMasterForm.value)
    .subscribe({
      next: (response: any) => {

        if (response?.responseCode === 200 &&
            response?.payload?.respCode === 200) {

          // ✅ SHOW TOAST FIRST
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.payload.respMesg,
            life: 3000
          });

          // ✅ RESET FORM
          this.currencyMasterForm.reset();

          // ✅ CLOSE DIALOG AFTER SMALL DELAY
          setTimeout(() => {
            this.dialogRef?.close();
          }, 100);

          // Optional: reload table
          this.getCurrencyMasterList();

        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response?.payload?.respMesg || 'Operation failed',
            life: 4000
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Server Error',
          detail: 'Something went wrong',
          life: 4000
        });
      }
    });
}



public submitCurrencyMasterForm(): void {

  if (this.currencyMasterForm.invalid) {
    this.currencyMasterForm.markAllAsTouched();
    return;
  }

  this.currencyMasterService
    .addCurrencyMaster(this.currencyMasterForm.value)
    .subscribe({
      next: (response: any) => {

        if (response?.responseCode === 200 &&
            response?.payload?.respCode === 200) {

          // ✅ SHOW TOAST FIRST
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.payload.respMesg,
            life: 3000
          });

          // ✅ RESET FORM
          this.currencyMasterForm.reset();

          // ✅ CLOSE DIALOG AFTER SMALL DELAY
          setTimeout(() => {
            this.dialogRef?.close();
          }, 100);

          // Optional: reload table
          this.getCurrencyMasterList();

        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response?.payload?.respMesg || 'Operation failed',
            life: 4000
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Server Error',
          detail: 'Something went wrong',
          life: 4000
        });
      }
    });
}



}
