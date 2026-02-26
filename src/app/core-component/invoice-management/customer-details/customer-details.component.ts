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
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { CustomerDetailsService } from './customer-details.service';
import { UserDetails } from '../../interface/user-management';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { AuthenticationService } from 'src/app/auth/authentication.service'; 


@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent {


  public customerList: any;
  public fullData: any[] = [];
  
    public routes = routes;
    // pagination variables
    public tableData: Array<any> = [];
    public pageSize = 2;
    public serialNumberArray: Array<number> = [];
    public totalData = 0;
    showFilter = false;
    dataSource!: MatTableDataSource<UserDetails>;
    public searchDataValue = '';
    //** / pagination variables
  
    constructor(
      private data: DataService,
      private pagination: PaginationService,
      private router: Router,
      private sidebar: SidebarService,
      private fb: FormBuilder,
      private authenticationService: AuthenticationService,
      private messageService: MessageService,
      private customerDetailsService: CustomerDetailsService,
      private dialog: MatDialog,
      private cookieService: CookieService
    ) {
      // this.loginUser = this.authenticationService.getLoginUser();
    }

    ngOnInit() {
    this.getCustomerDetails();
    
  }

    public getCustomerDetails(): void {
        this.serialNumberArray = []; // Clear serial number array before fetching new data
      
        this.customerDetailsService.getCustomerDetails().subscribe((apiRes: any) => {
          this.totalData = apiRes.totalNumber; // Set total data count
          this.fullData = apiRes.listPayload;  // Store the full dataset
      
          this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
            if (this.router.url === this.routes.users) {
              this.pageSize = res.pageSize;
              // Use the full dataset for pagination
              this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
              this.pageSize = res.pageSize;
            }
          });
        });
      }
      
        prepareTableData(apiRes: any[], pageOption: pageSelection): void {
          this.tableData = []; // Reset table data
          this.serialNumberArray = []; // Reset serial numbers
        
          // Slice data based on pagination limits (skip, limit)
          const dataToDisplay = apiRes.slice(pageOption.skip, pageOption.limit);
        
          // Add serial numbers and prepare table data
          dataToDisplay.forEach((res: any, index: number) => {
            const serialNumber = index + 1;
            this.tableData.push(res);
            this.serialNumberArray.push(serialNumber);
          });
        
          // Update MatTableDataSource
          this.dataSource = new MatTableDataSource<any>(this.tableData);
        
          // Emit updated pagination data
          this.pagination.calculatePageSize.next({
            totalData: this.totalData,
            pageSize: this.pageSize,
            tableData: this.tableData,
            serialNumberArray: this.serialNumberArray,
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
          const searchTerm = value.trim().toLowerCase();
      
          if (searchTerm) {
            // Filter the full dataset based on the search term
            const filteredData = this.fullData.filter((donation: UserDetails) =>
              Object.values(donation).some((field) =>
                String(field).toLowerCase().includes(searchTerm)
              )
            );
      
            this.prepareTableData(filteredData, { skip: 0, limit: this.pageSize });
            this.totalData = filteredData.length; // Update total data count for pagination
          } else {
            // Reset to the full dataset when the search term is cleared
            this.prepareTableData(this.fullData, { skip: 0, limit: this.pageSize });
            this.totalData = this.fullData.length; // Reset the total data count
          }
      
          // Reset to the first page after a search or clearing search
          this.pagination.calculatePageSize.next({
            totalData: this.totalData,
            pageSize: this.pageSize,
            tableData: this.tableData,
            serialNumberArray: this.serialNumberArray,
          });
        }
    
      // public searchData(value: string): void {
      //   this.dataSource.filter = value.trim().toLowerCase();
      //   this.tableData = this.dataSource.filteredData;
      // }
    
      isCollapsed: boolean = false;
      toggleCollapse() {
        this.sidebar.toggleCollapse();
        this.isCollapsed = !this.isCollapsed;
      }
      public filter = false;
      openFilter() {
        this.filter = !this.filter;
      }
      confirmColor(loginId : any) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: ' btn btn-success',
            cancelButton: 'me-2 btn btn-danger',
          },
          buttonsStyling: false,
        });
  
}
}
