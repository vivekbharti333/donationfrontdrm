/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
// import Swal from 'sweetalert2';
import { LeadManagementService } from '../../lead-management.service';
// import { UserManagementService } from '../user-management.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-followup-one',
  templateUrl: './followup-one.component.html',
  styleUrl: './followup-one.component.scss',
  providers: [MessageService, ToastModule],
})
export class FollowupOneComponent {
  public followupList: any;

  public routes = routes;

  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService
  ) {}

  ngOnInit() {
    this.getFollowupOneList();
  }
  // getFollowupOneList() {
  //   this.leadManagementService.getFollowupOneList().subscribe((apiRes: any) => {
  //     this.totalData = apiRes.totalNumber;
  //     this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
  //       if (this.router.url == this.routes.users) {
  //         this.getTableData({ skip: res.skip, limit: this.totalData });
  //         this.pageSize = res.pageSize;
  //       }
  //     });
  //   });
  // }

  getFollowupOneList() {
    this.leadManagementService.getFollowupOneList().subscribe((apiRes: any) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalNumber;
      this.pagination.tablePageSize.subscribe((pageRes: tablePageSize) => {
        if (this.router.url == this.routes.followupOne) {
          apiRes.listPayload.map((res: any, index: number) => {
            const serialNumber = index + 1;
            if (index >= pageRes.skip && serialNumber <= this.totalData) {
              this.tableData.push(res);
              this.serialNumberArray.push(serialNumber);
            }
          });
          this.dataSource = new MatTableDataSource<users>(this.tableData);
          // const dataSize = this.tableData.length;
          this.pagination.calculatePageSize.next({
            totalData: this.totalData,
            pageSize: this.pageSize,
            tableData: this.tableData,
            serialNumberArray: this.serialNumberArray,
          });
        }
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
}
