import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  // DataService,
  pageSelection,
  // apiResultFormat,
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
import { HelperService } from 'src/app/core/service/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { UserManagementService } from '../../../user-management/user-management.service';
import { DonationDetails } from 'src/app/core-component/interface/donation-management';

@Component({
  selector: 'app-won',
  templateUrl: './won.component.html',
  styleUrl: './won.component.scss',
  providers: [MessageService, ToastModule],
})
export class WonComponent {

  public followupList: any;
  public userForDropDown : any[]=[];

  public routes = routes;
  firstDate: any = '';
  lastDate: any = '';
  public leadList: any;

  // pagination variables
  public tableData: Array<any> = [];
  public categoryTypeList: Array<any> = [];
  public superCategoryList: Array<any> = [];
  public categoryList: Array<any> = [];
  public subCategoryList: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  // dataSource!: MatTableDataSource<users>;
  dataSource!: MatTableDataSource<DonationDetails>;
  public searchDataValue = '';


  constructor(
    // private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService,
    private helper: HelperService,
    private dialog: MatDialog,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
  ) {}

  ngOnInit() {
    (async () => {
      await 
      this.getAllLeadList('MONTH');
      // this.getUserListForDropDown();
      // this.getCategoryType();
    })();
  }

  filterByDate() {
    this.leadManagementService
      .getLeadListByDate(Constant.LOST,this.firstDate, this.lastDate)
      .subscribe((apiRes: any) => {
        // this.setTableData(apiRes);
      });
  }
  setFilterDate(eve: any, date: any) {
    if (date === 'first') {
      this.firstDate = eve.target.value;
    }
    if (date === 'last') {
      this.lastDate = eve.target.value;
    }
  }

  onAgentSelectionChange(dd:any){
    alert(dd)
      }

  //   getWonList() {
  //   this.leadManagementService.getLeadListByStatus(Constant.WIN).subscribe((apiRes: any) => {
  //     this.setTableData(apiRes);
  //   });
  // }

  // setTableData(apiRes: any) {
  //   this.tableData = [];
  //   this.serialNumberArray = [];
  //   this.totalData = apiRes.totalNumber;
  //   this.pagination.tablePageSize.subscribe((pageRes: tablePageSize) => {
  //     if (this.router.url == this.routes.importaintLead) {
  //       apiRes.listPayload.map((res: any, index: number) => {
  //         const serialNumber = index + 1;
  //         if (index >= pageRes.skip && serialNumber <= this.totalData) {
  //           this.tableData.push(res);
  //           // this.setIsDataCopied(false, index);
  //           this.serialNumberArray.push(serialNumber);
  //         }
  //       });
  //       this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);
  //       const dataSize = this.tableData.length;
  //       this.pagination.calculatePageSize.next({
  //         totalData: this.totalData,
  //         pageSize: this.pageSize,
  //         tableData: this.tableData,
  //         serialNumberArray: this.serialNumberArray,
  //       });
  //       // this.pageSize = res.pageSize;
  //     }
  //   });
  // }

  getAllLeadList(tabName:any) {
    this.leadManagementService.getLeadListByStatus(Constant.WIN).subscribe((apiRes: any) => {

      this.totalData = apiRes.totalNumber;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.wonLead) {
          this.getTableData({ skip: res.skip, limit: (res.skip)+ this.pageSize },tabName);
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  private getTableData(pageOption: pageSelection, tabName: any): void {
    this.leadManagementService.getLeadListByStatus(Constant.WIN).subscribe((apiRes: any) => {

          this.leadList = apiRes.listPayload;
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
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }


  getBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'win':
        return 'badge-linewin';
      case 'lost':
        return 'badge-linedanger';
      case 'info':
        return 'badge-lineinfo';
      case 'followup':
        return 'badge-linewarning';
      // case 'win':
      //   return 'badge-linewin';
      // case 'assigned':
      //   return 'badge-lineassigned';
      case 'OTHER':
        return 'badge-linereserved';
      default:
        return 'badge-default'; // Default class if no match
    }
  }

}
