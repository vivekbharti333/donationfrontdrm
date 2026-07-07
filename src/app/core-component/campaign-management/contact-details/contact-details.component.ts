import { Component, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
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
import { ContactDetailsService } from './contact-details.service';
import { Constant } from 'src/app/core/constant/constants';
import { MatDialog } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';


@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',
  providers: [MessageService],
})
export class ContactDetailsComponent {

  // pagination variables
  public routes = routes;
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<any>;
  public searchDataValue = '';
  // pagination variables

  constructor(
      private data: DataService,
      private pagination: PaginationService,
      private router: Router,
      private sidebar: SidebarService,
      private messageService: MessageService,
      private contactDetailsService: ContactDetailsService,
      private dialog: MatDialog
    ) {}
  
      ngOnInit() {
      this.getContactDetails();
  
    }
  
    getContactDetails() {
        this.contactDetailsService
          .getContactDetails()
          .subscribe((apiRes: any) => {
            this.totalData = apiRes.totalNumber;
            this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
              if (this.router.url == this.routes.campaignReport) {
                this.getTableData({ skip: res.skip, limit: this.totalData });
                this.pageSize = res.pageSize;
              }
            });
          });
      }
    
      private getTableData(pageOption: pageSelection): void {
        this.contactDetailsService
          .getContactDetails()
          .subscribe((apiRes: any) => {
            this.tableData = [];
            this.serialNumberArray = [];
            this.totalData = apiRes.totalNumber;
            apiRes.listPayload.map((res: any, index: number) => {
              const serialNumber = index + 1;
              if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
                this.tableData.push(res);
                this.serialNumberArray.push(serialNumber);
              }
            });
            this.dataSource = new MatTableDataSource<any>(this.tableData);
            const dataSize = this.tableData.length;
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
      isCollapsed: boolean = false;
      toggleCollapse() {
        this.sidebar.toggleCollapse();
        this.isCollapsed = !this.isCollapsed;
      }
      public filter = false;
      openFilter() {
        this.filter = !this.filter;
      }
  
       changeStatus(rowdata: any) {

      
    }

}
