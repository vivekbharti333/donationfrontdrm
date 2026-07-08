import { Component, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DataService, pageSelection, SidebarService } from 'src/app/core/core.index';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { MessageService } from 'primeng/api';
import { ContactDetailsService } from './contact-details.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
  providers: [MessageService],
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  public routes = routes;

  public addContactDialog: any;
  public addContactForm!: FormGroup;
  public editContactDialog: any;
  public editContactForm!: FormGroup;

  selectedContact: any;
  public deleteMsgContactDialog: any;

  // table data
  public allTableData: any[] = [];   // full API data
  public tableData: any[] = [];      // current page data
  public dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  // pagination
  public pageSize = 10;
  public totalData = 0;
  public serialNumberArray: number[] = [];

  // search/filter
  public searchDataValue = '';
  public filter = false;

  // ui
  public isCollapsed = false;
  public isLoading = false;

  private pageSizeSub?: Subscription;

  constructor(
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private contactDetailsService: ContactDetailsService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.createForms();
    this.loadContactDetails();

    this.pageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url === this.routes.campaignReport || this.router.url.includes('contact-details')) {
        this.pageSize = res.pageSize;
        this.updatePagedData({ skip: res.skip, limit: res.limit });
      }
    });
  }

  ngOnDestroy(): void {
    this.pageSizeSub?.unsubscribe();
  }

  // createForms() {
  //     this.addContactForm = this.fb.group({
  //       id: [''],
  //       contactName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
  //       mobileNumber: [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
  //       alternateNumber: [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
  //       emailId: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
  //       companyName: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
  //       address: [''],
  //       city: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
  //       leadSource: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
  //     });
  //   }
  createForms() {
  this.addContactForm = this.fb.group({
    id: [''],
    contactName: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[A-Za-z][A-Za-z\s.'-]{2,99}$/) ]],
    mobileNumber: ['',[Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    alternateNumber: ['',[Validators.pattern(/^[6-9]\d{9}$/)]],
    emailId: ['',[Validators.required,Validators.email, Validators.maxLength(150)]],
    companyName: ['', [Validators.required, Validators.minLength(2),Validators.maxLength(150), Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9\s.&()'-]{1,149}$/)]],
    address: ['', [Validators.maxLength(250),Validators.pattern(/^[A-Za-z0-9\s,./#()-]*$/)]],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(/^[A-Za-z\s.'-]+$/)]],
    leadSource: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
  });
  
  this.editContactForm = this.fb.group({
    id: [''],
    contactName: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[A-Za-z][A-Za-z\s.'-]{2,99}$/) ]],
    mobileNumber: ['',[Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    alternateNumber: ['',[Validators.pattern(/^[6-9]\d{9}$/)]],
    emailId: ['',[Validators.required,Validators.email, Validators.maxLength(150)]],
    companyName: ['', [Validators.required, Validators.minLength(2),Validators.maxLength(150), Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9\s.&()'-]{1,149}$/)]],
    address: ['', [Validators.maxLength(250),Validators.pattern(/^[A-Za-z0-9\s,./#()-]*$/)]],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(/^[A-Za-z\s.'-]+$/)]],
    leadSource: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
  });
}

  loadContactDetails(): void {
    this.isLoading = true;

    this.contactDetailsService.getContactDetails().subscribe({
      next: (apiRes: any) => {
        this.allTableData = apiRes?.listPayload || [];
        this.totalData = apiRes?.totalNumber || this.allTableData.length;

        this.dataSource = new MatTableDataSource<any>(this.allTableData);

        // initial page load
        this.updatePagedData({
          skip: 0,
          limit: this.pageSize
        });

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.allTableData = [];
        this.tableData = [];
        this.dataSource = new MatTableDataSource<any>([]);
      }
    });
  }

  updatePagedData(pageOption: pageSelection): void {
    const sourceData = this.dataSource.filteredData?.length
      ? this.dataSource.filteredData
      : this.allTableData;

    this.totalData = sourceData.length;
    this.tableData = [];
    this.serialNumberArray = [];

    sourceData.forEach((item: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        this.tableData.push(item);
        this.serialNumberArray.push(serialNumber);
      }
    });

    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray,
    });
  }

  public sortData(sort: Sort): void {
    const data = [...this.dataSource.filteredData.length ? this.dataSource.filteredData : this.allTableData];

    if (!sort.active || sort.direction === '') {
      this.dataSource.data = [...this.allTableData];
    } else {
      data.sort((a, b) => {
        const aValue = this.getSortValue(a, sort.active);
        const bValue = this.getSortValue(b, sort.active);

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sort.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sort.direction === 'asc' ? 1 : -1;

        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });

      this.dataSource.data = data;
    }

    this.updatePagedData({
      skip: 0,
      limit: this.pageSize
    });
  }

  private getSortValue(item: any, key: string): any {
    switch (key) {
      case 'contactName':
        return item.contactName?.toLowerCase();
      case 'mobileNumber':
        return item.mobileNumber;
      case 'companyName':
        return item.companyName?.toLowerCase();
      case 'city':
        return item.city?.toLowerCase();
      case 'leadSource':
        return item.leadSource?.toLowerCase();
      case 'status':
        return item.status?.toLowerCase();
      case 'createdAt':
        return item.createdAt ? new Date(item.createdAt).getTime() : 0;
      default:
        return item[key];
    }
  }

  public searchData(value: string): void {
    const filterValue = value.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        (data.contactName || '').toLowerCase().includes(filter) ||
        (data.mobileNumber || '').toString().toLowerCase().includes(filter) ||
        (data.companyName || '').toLowerCase().includes(filter) ||
        (data.city || '').toLowerCase().includes(filter) ||
        (data.leadSource || '').toLowerCase().includes(filter) ||
        (data.status || '').toLowerCase().includes(filter)
      );
    };

    this.dataSource.filter = filterValue;

    this.updatePagedData({
      skip: 0,
      limit: this.pageSize
    });
  }

  toggleCollapse(): void {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  openFilter(): void {
    this.filter = !this.filter;
  }

  openAddModal(templateRef: TemplateRef<any>) {
      this.addContactDialog = this.dialog.open(templateRef, {
        width: '1400px', // Set your desired width
        // height: '600px', // Set your desired height
        disableClose: true, // Optional: prevent closing by clicking outside
        panelClass: 'custom-modal', // Optional: add custom class for additional styling
      });
    }

    public saveContactDetails() {
    this.contactDetailsService.saveContactDetails(this.addContactForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });

              this.addContactForm.reset();
              this.addContactDialog.close();
             
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
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }


  public changeStatus(rowdata: any): void {
    this.contactDetailsService.changeContactStatus(rowdata)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });

              this.loadContactDetails();
             
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
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }


openDeleteModal(template: TemplateRef<any>, contact: any) {
  this.selectedContact = contact;

  this.deleteMsgContactDialog = this.dialog.open(template, {
    width: '450px',
    disableClose: true
  });
}


deleteSelectedContact() {
  this.deleteContactDetails(this.selectedContact);
}


  public deleteContactDetails(rowdata: any): void {
    this.contactDetailsService.deleteContactDetails(rowdata)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });

              this.loadContactDetails();
              this.deleteMsgContactDialog.close();
             
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
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

  openEditModal(templateRef: TemplateRef<any>, rawData: any) {

     this.editContactForm.patchValue({
        id: rawData['id'],
        contactName: rawData['contactName'],
        mobileNumber: rawData['mobileNumber'],
        alternateNumber: rawData['alternateNumber'],
        emailId: rawData['emailId'],
        companyName: rawData['companyName'],
        address: rawData['address'],
        city: rawData['city'],
        leadSource: rawData['leadSource'],
      });

      this.editContactDialog = this.dialog.open(templateRef, {
        width: '1400px', // Set your desired width
        // height: '600px', // Set your desired height
        disableClose: true, // Optional: prevent closing by clicking outside
        panelClass: 'custom-modal', // Optional: add custom class for additional styling
      });
    }


    public updateContactDetails() {
    this.contactDetailsService.saveContactDetails(this.editContactForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            let payload = response['payload'];
            if (response['payload']['respCode'] == '200') {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });

              this.loadContactDetails();
              this.editContactForm.reset();
              this.editContactDialog.close();
             
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
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }


 

selectedFile: File | null = null;
selectedFileName: string = '';

onFileChange(event: any): void {
  const file = event.target.files[0];

  if (file) {
    const allowedExtensions = ['xls', 'xlsx'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      alert('Please select a valid Excel file (.xls or .xlsx)');
      event.target.value = '';
      this.selectedFile = null;
      this.selectedFileName = '';
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }
}

uploadFile(): void {
  if (!this.selectedFile) {
    alert('Please select a file first');
    return;
  }

  this.contactDetailsService
    .uploadExcel(this.selectedFile)
    .subscribe({
      next: (res) => {
        console.log('Upload success', res);
        alert('File uploaded successfully');
        this.selectedFile = null;
        this.selectedFileName = '';
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('File upload failed');
      }
    });
}

}
