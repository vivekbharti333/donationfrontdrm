import { Component, TemplateRef } from '@angular/core';
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
import { CategoriesManagementService } from '../categories-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-super-categories',
  templateUrl: './super-categories.component.html',
  styleUrl: './super-categories.component.scss',
  providers: [MessageService, ToastModule],
})
export class SuperCategoriesComponent {
  public routes = routes;
  public categoryTypeList: any[] = [];
  public baseUrl = Constant.Site_Url;

  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables
  addSuperCategoryDialog: any;
  editSuperCategoryDialog: any;
  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private categoriesManagementService: CategoriesManagementService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getSuperCategory();
    this.getCategoryType();
  }

  public superCategory = {
    superCategoryImage: '',
    categoryTypeId: '',
    categoryTypeName: '',
    superCategory: '',
    status: '',
    isChecked: '',
  };

  public editSuperCategory = {
    categoryTypeId: '',
    superCategoryId: '',
    categoryTypeName: '',
    superCategory: '',
    status: '',
    createdAt: '',
  };

  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

  submitSuperCategoryForm() {
    this.categoriesManagementService
      .addSuperCategory(this.superCategory)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // alert(response['payload']['respMesg']);
              //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              // this.user;
              // this.modalInstance.hide();
              this.addSuperCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getSuperCategory();
            } else {
              // alert(response['payload']['respMesg']);

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: () =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
          }),
      });
    // this.isLoading = false;
  }

  submitEditedSuperCategoryForm() {
    this.categoriesManagementService
      .editSuperCategory(this.editSuperCategory)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.editSuperCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getSuperCategory();
            } else {
              // alert(response['payload']['respMesg']);
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: () =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
          }),
      });
    // this.isLoading = false;
  }

  changeStatus(rowdata: any) {
    this.categoriesManagementService
      .changeSuperCategoryStatus(rowdata)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getSuperCategory();
            } else {
              // alert(response['payload']['respMesg']);

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: () =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
          }),
      });
    // this.isLoading = false;
  }

  // openAddModal(rowDate: any) {

  //   this.superCategory.categoryTypeName = rowDate[5];
  //   this.superCategory.status = rowDate[5];
  //   this.superCategory.superCategory = rowDate[2]; // Assign the value to user.firstName
  //   this.superCategory.isChecked = rowDate[5];
  //   this.superCategory.categoryTypeId = rowDate[0]

  // }

  openAddModal(templateRef: TemplateRef<any>) {
    // this.superCategory.categoryTypeName = rowDate[5];
    // this.superCategory.status = rowDate[5];
    // this.superCategory.superCategory = rowDate[2]; // Assign the value to user.firstName
    // this.superCategory.isChecked = rowDate[5];
    // this.superCategory.categoryTypeId = rowDate[0]
    this.addSuperCategoryDialog = this.dialog.open(templateRef, {
      width: '50rem',
    });
  }

  // openEditModal(rowDate: any) {
  //   this.getCategoryType();
  //   this.editSuperCategory.categoryTypeName = rowDate[5];
  //   this.editSuperCategory.createdAt = rowDate[4];
  //   this.editSuperCategory.status = rowDate[3];
  //   this.editSuperCategory.superCategory = rowDate[2]; // Assign the value to user.firstName
  //   this.editSuperCategory.categoryTypeId = rowDate[1]
  //   this.editSuperCategory.superCategoryId = rowDate[0]

  // }

  openEditModal(templateRef: TemplateRef<any>, rowData: any) {
    this.getCategoryType();
    this.editSuperCategory.superCategoryId = rowData.id;
    this.editSuperCategory.categoryTypeName = rowData.categoryTypeName;
    this.editSuperCategory.createdAt = rowData.createdAt;
    this.editSuperCategory.status = rowData.status;
    this.editSuperCategory.superCategory = rowData.superCategory;
    this.editSuperCategory.categoryTypeId = rowData.categoryTypeId;
    this.editSuperCategoryDialog = this.dialog.open(templateRef, {
      width: '50rem',
    });
  }

  getSuperCategory() {
    this.categoriesManagementService
      .getSuperCategoryList()
      .subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.superCategory) {
            this.getTableData({ skip: res.skip, limit: this.totalData });
            this.pageSize = res.pageSize;
          }
        });
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.categoriesManagementService
      .getSuperCategoryList()
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
        this.dataSource = new MatTableDataSource<users>(this.tableData);
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

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part
        // Set the base64 string to the userPicture field
        this.superCategory.superCategoryImage =
          'data:image/png;base64,' + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }
}
