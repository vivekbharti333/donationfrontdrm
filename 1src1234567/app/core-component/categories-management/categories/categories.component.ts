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
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  providers: [MessageService, ToastModule],
})
export class CategoriesComponent {
  public routes = routes;
  public categoryTypeList: any[] = [];
  public superCategoryList: any[] = [];
  public editSuperCategoryList: any[] = [];
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
  addCategoryDialog: any;
  editCategoryDialog: any;
  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private categoriesManagementService: CategoriesManagementService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getCategoryDetailsList();
    this.getCategoryType();
    this.getSuperCategory();
  }

  public addCategory = {
    categoryImage: '',
    categoryTypeId: '',
    superCategoryId: '',
    category: '',
    superCategory: '',
  };

  public editCategory = {
    categoryId: '',
    categoryTypeId: '',
    categoryTypeName: '',
    superCategoryId: '',
    superCategory: '',
    category: '',
    createdAt: '',
    status: '',
  };

  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.superCategoryList = [];
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

  public getSuperCategory() {
    this.categoriesManagementService.getSuperCategoryList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.editSuperCategoryList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.superCategoryList = [];
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

  public getSuperCategoryByCateTypeId(rowData: any) {
    this.categoriesManagementService
      .getSuperCategoryListByCategoryTypeId(rowData.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(
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

  submitCategoryForm() {
    this.categoriesManagementService
      .addCategoryDetails(this.addCategory)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // alert(response['payload']['respMesg']);
              //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              // this.user;
              // this.modalInstance.hide();
              this.addCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getCategoryDetailsList();
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

  submitEditedCategoryForm() {
    this.categoriesManagementService.editCategoryDetails(this.editCategory)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.editCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getCategoryDetailsList();
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
    this.categoriesManagementService.changeCategoryStatus(rowdata).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'success-background-popover',
            });
            this.getCategoryDetailsList();
          } else {
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

  openAddModal(templateRef: TemplateRef<any>) {
    // this.superCategory.categoryTypeName = rowDate[5];
    // this.superCategory.status = rowDate[5];
    // this.superCategory.superCategory = rowDate[2]; // Assign the value to user.firstName
    // this.superCategory.isChecked = rowDate[5];
    // this.superCategory.categoryTypeId = rowDate[0]
    (this.addCategoryDialog = this.dialog.open(templateRef)),
      {
        width: '50rem',
      };
  }

  openEditModal(templateRef: TemplateRef<any>, rowData: any) {
    // this.getCategoryType();
    const filterCategoryType: any = this.categoryTypeList.filter((item) => {
      if (item?.categoryTypeName === rowData.categoryTypeName) {
        return item;
      }
    });
    this.editCategory.categoryId = rowData.id;
    this.editCategory.categoryTypeId = rowData.categoryTypeId;
    this.editCategory.categoryTypeName = rowData.categoryTypeName;
    this.editCategory.superCategoryId = rowData.superCategoryId;
    this.editCategory.superCategory = rowData.superCategory;
    this.editCategory.category = rowData.category;
    this.editCategory.createdAt = rowData.createdAt;
    this.editCategory.status = rowData.status;
    // console.log('rowData++++++++', this.editCategory, filterCategoryType);
    // this.editCategory.superCategory = rowDate[2]; // Assign the value to user.firstName
    // this.editCategory.superCategoryId = rowData[1];
    (this.editCategoryDialog = this.dialog.open(templateRef)),
      {
        width: '50rem',
      };
  }

  getCategoryDetailsList() {
    this.categoriesManagementService
      .getCategoryDetailsList()
      .subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.category) {
            this.getTableData({ skip: res.skip, limit: this.totalData });
            this.pageSize = res.pageSize;
          }
        });
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.categoriesManagementService
      .getCategoryDetailsList()
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
        this.addCategory.categoryImage =
          'data:image/png;base64,' + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }
}
