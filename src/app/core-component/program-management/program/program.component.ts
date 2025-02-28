import { Component, importProvidersFrom, TemplateRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ReceiptHeaderListService } from '../../receipt-management/receipt-header-list/receipt-header-list.service';
import { ProgramManagementService } from '../../program-management/program-management.service';
import { CurrencyService } from '../../currency-management/currency/currency.service';
import { PaymentModeService } from '../../payment-mode-management/payment-mode/payment-mode.service';
import { ProgramDetails, ProgramDetailsRequest } from '../../interface/program-management';
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
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { Constant } from 'src/app/core/constant/constants';
import { MessageService } from 'primeng/api';



@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrl: './program.component.scss',
  providers: [MessageService, ToastModule],
})
export class ProgramComponent {

  public editProgramModel: any;
  public saveProgramDialog: any;

  public loginUser: any;
  public programList: any;
  public currencyList: any;
  public isLoading = true;
  public visible = false;
  public addPopupVisible = false;
  public editProgramForm!: FormGroup;
  public addProgramForm!: FormGroup;
  public addProgramAmountForm!: FormGroup;

  // pagination variables
  public routes = routes;
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<ProgramDetails>;
  public searchDataValue = '';
  public pageNumberArray: Array<number> = [];
  roleType: string = '';
  // pagination variables


  constructor(
    private fb: FormBuilder,
    private programManagementService: ProgramManagementService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private dialog: MatDialog,
    private messageService: MessageService,
    private currencyService: CurrencyService,
  ) {
    // this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    this.getProgramDetailsList();
    this.getCurrencyDetails();
    this.createForms();
    // this.checkRoleType();
  }

  createForms() {
    this.addProgramForm = this.fb.group({
      programName: ['', [Validators.required]],
      programAmount: ['', [Validators.required]],
    });
    this.editProgramForm = this.fb.group({
      id: [''],
      programName: ['', [Validators.required]],
      programAmount: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
    });
    this.addProgramAmountForm = this.fb.group({
      programId: ['', [Validators.required]],
      programAmount: ['', [Validators.required]],
      currencyMasterId: ['', [Validators.required]],
      currencyCode: ['', [Validators.required]],
    })
  }


  // public getProgramDetailsList() {
  //   this.programManagementService.getProgramDetailsList().subscribe((apiRes: any) => {
  //     this.totalData = apiRes.totalNumber;
  //     this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
  //       if (this.router.url == this.routes.program) {
  //         this.getTableData({ skip: res.skip, limit: this.totalData });
  //         this.pageSize = res.pageSize;
  //       }
  //     });
  //   });
  // }

  // private getTableData(pageOption: pageSelection): void {
  //   this.programManagementService.getProgramDetailsList().subscribe((apiRes: any) => {
  //     this.tableData = [];
  //     this.serialNumberArray = [];
  //     this.totalData = apiRes.totalNumber;
  //     apiRes.listPayload.map((res: any, index: number) => {
  //       const serialNumber = index + 1;
  //       if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
  //         this.tableData.push(res);
  //         this.serialNumberArray.push(serialNumber);
  //       }
  //     });
  //     this.dataSource = new MatTableDataSource<users>(this.tableData);
  //     const dataSize = this.tableData.length;
  //     this.pagination.calculatePageSize.next({
  //       totalData: this.totalData,
  //       pageSize: this.pageSize,
  //       tableData: this.tableData,
  //       serialNumberArray: this.serialNumberArray,
  //     });
  //   });
  // }


  getProgramDetailsList(): void {
    this.programManagementService.getProgramDetailsList().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber; // Ensure totalData reflects the total count

      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.program) {
          this.pageSize = res.pageSize;

          // Use the received data for table and pagination calculations
          this.updateTableData(apiRes, { skip: res.skip, limit: res.skip + this.pageSize });
        }
      });
    });
  }


  private updateTableData(apiRes: any, pageOption: pageSelection): void {
    // Ensure listPayload exists before proceeding
    this.programList = apiRes.listPayload ?? [];
    this.tableData = [];
    this.pageNumberArray = [];

    // Paginate the data locally without making another API call
    this.programList.forEach((res: ProgramDetails, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        this.tableData.push(res);
        this.pageNumberArray.push(serialNumber);
      }
    });

    // Update the data source and pagination
    this.dataSource = new MatTableDataSource<ProgramDetails>(this.tableData);
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.pageNumberArray,
    });
  }

  public searchData(value: string): void {
    const searchTerm = value.trim().toLowerCase();

    if (!this.programList || this.programList.length === 0) {
      return;
    }

    const filteredData = this.programList.filter((lead: any) =>
      Object.values(lead)
        .filter((field) => field !== null && field !== undefined) // Remove null/undefined values
        .some((field) => String(field).toLowerCase().includes(searchTerm)) // Convert explicitly to string
    );

    this.tableData = filteredData;
    this.dataSource = new MatTableDataSource<any>(this.tableData);

    this.pagination.calculatePageSize.next({
      totalData: this.tableData.length,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.tableData.map((_, index) => index + 1),
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


  openAddModel(templateRef: TemplateRef<any>) {

    this.saveProgramDialog = this.dialog.open(templateRef, {
      width: '800px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });


  }

  addProgramDetails() {
    this.programManagementService.addProgramDetails(this.addProgramForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.addProgramForm.reset();

              this.getProgramDetailsList();

              this.saveProgramDialog.close();

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });

            } else {

              this.saveProgramDialog.close();

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {

            this.saveProgramDialog.close();

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
  }

  
  addProgramDetailsAmount() {
    this.programManagementService.addProgramDetailsAmount(this.addProgramAmountForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.addProgramForm.reset();

              this.getProgramDetailsList();

              this.saveProgramDialog.close();

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });

            } else {

              this.saveProgramDialog.close();

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {

            this.saveProgramDialog.close();

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
  }

  openEditModal(templateRef: TemplateRef<any>, rowData: any) {
    this.editProgramForm.patchValue({
      id: rowData['id'],
      programName: rowData['programName'],
      programAmount: rowData['programAmount'],
    });

    // this.dialog.open(templateRef);
    this.editProgramModel = this.dialog.open(templateRef, {
      width: '800px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });

  }

  openAddAountModal(templateRef: TemplateRef<any>, rowData: any) {
    this.addProgramAmountForm.patchValue({
      programId: rowData['id'],
      programName: rowData['programName'],
      // programAmount: rowData['programAmount'],
    });

    // this.dialog.open(templateRef);
    this.editProgramModel = this.dialog.open(templateRef, {
      width: '800px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });

  }

  updateProgramDetails() {
    this.programManagementService.updateProgramDetails(this.editProgramForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            // let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {
              // this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.editProgramForm.reset();
              // this.visible = !this.visible;
              // this.isLoading = false;
              this.editProgramModel.close();
              this.getProgramDetailsList();

            } else {
              // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
              this.isLoading = false;
            }
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
            this.isLoading = false;
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),

      });
  }


  changeProgramStatus(program: any) {
    this.programManagementService.changeProgramStatus(program)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              console.log("ok hai")
              // this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.getProgramDetailsList();
            } else {
              // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
            }
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  public getCurrencyDetails() {
    this.currencyService.getCurrencyDetailBySuperadmin()
      .subscribe({
        next: (response: any) => {

          if (response['responseCode'] == '200') {
            this.currencyList = JSON.parse(JSON.stringify(response['listPayload']));
            this.isLoading = false;
            // this.toastr.success(response['responseMessage']);
          } else {
            this.isLoading = false;
            // this.toastr.error(response['responseMessage'], response['responseCode']);
          }
          this.isLoading = false;
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

}
