import { Component, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
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
import { CampaignDetailsService } from './campaign-details.service';
import { Constant } from 'src/app/core/constant/constants';
import { MatDialog } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.scss'],
  providers: [MessageService],
})
export class CampaignDetailsComponent implements OnInit, OnDestroy {

  addCampaignDialog: any;
  public addCompaignForm!: FormGroup;

  public routes = routes;
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';

  editor!: Editor;

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private campaignDetailsService: CampaignDetailsService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.getCampaignDetailsList();
    this.createForms();
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }


  createForms() {
    this.addCompaignForm = this.fb.group({
      id: [''],
      campaignType: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      campaignName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      subject: [''],
      description: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
      campaignChannel: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],

    });
  }

  getCampaignDetailsList() {
    this.campaignDetailsService
      .getCampaignDetails()
      .subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.campaignDetails) {
            this.getTableData({ skip: res.skip, limit: this.totalData });
            this.pageSize = res.pageSize;
          }
        });
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.campaignDetailsService
      .getCampaignDetails()
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

  openAddModal(templateRef: TemplateRef<any>) {
    this.addCampaignDialog = this.dialog.open(templateRef, {
      width: '1400px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });
  }


  public saveCompaignDetails() {
    this.campaignDetailsService.saveCompaignDetails(this.addCompaignForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {
              //this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });

              this.addCompaignForm.reset();
              this.addCampaignDialog.close();
             
            } else {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-light-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['responseCode'],
              detail: response['responseMessage'],
              styleClass: 'danger-light-popover',
            });
          }

          // this.messageService.add({
          //   summary: 'Toast',
          //   detail: 'Your,toast message here.',
          //   styleClass: 'danger-light-popover',
          // });
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  changeStatus(rowdata: any) {
    // this.categoriesManagementService.changeCategoryStatus(rowdata).subscribe({
    //   next: (response: any) => {
    //     if (response['responseCode'] == '200') {
    //       if (response['payload']['respCode'] == '200') {
    //         this.messageService.add({
    //           summary: response['payload']['respCode'],
    //           detail: response['payload']['respMesg'],
    //           styleClass: 'success-background-popover',
    //         });
    //         this.getCategoryDetailsList();
    //       } else {
    //         this.messageService.add({
    //           summary: response['payload']['respCode'],
    //           detail: response['payload']['respMesg'],
    //           styleClass: 'danger-background-popover',
    //         });
    //       }
    //     } else {
    //       this.messageService.add({
    //         summary: response['payload']['respCode'],
    //         detail: response['payload']['respMesg'],
    //         styleClass: 'danger-background-popover',
    //       });
    //     }
    //   },
    //   error: () =>
    //     this.messageService.add({
    //       summary: '500',
    //       detail: 'Server Error',
    //     }),
    // });

  }



}
