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
import { AudienceService } from '../campaign-send/audience.service';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
  providers: [MessageService],
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  audiences: any[] = [];
  targetAudienceId: number | null = null;
  audienceError = '';
  audienceBusy = false;
  audiencesLoading = false;
  filterAudienceId: number | null = null;
  uploadAudienceId: number | null = null;
  statusFilter = '';
  uploadError = '';
  uploadDialog?: import('@angular/material/dialog').MatDialogRef<any>;
  private contactsSub?: Subscription;
  loadAudiences(): void {
    this.audiencesLoading = true;
    this.contactDetailsService.getAudienceList().subscribe({ next: r => {
      this.audiencesLoading = false;
      this.audiences = [];
      if ([200, 204].includes(Number(r.responseCode))) {
        this.audiences = r.listPayload || [];
      } else {
        this.messageService.add({ severity: 'error', summary: 'Audiences',
          detail: r.responseMessage || 'Could not load audiences.' });
      }
      if (!this.audiences.some(audience => audience.id === this.targetAudienceId)) {
        this.targetAudienceId = null;
      }
    }, error: () => {
      this.audiencesLoading = false;
      this.audiences = [];
      this.targetAudienceId = null;
      this.messageService.add({ severity: 'error', summary: 'Audiences', detail: 'Could not load audiences.' });
    } });
  }
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
    private audienceService: AudienceService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.createForms();
    this.loadContactDetails();
    this.loadAudiences();

    this.pageSizeSub = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url === this.routes.campaignReport || this.router.url.includes('contact-details')) {
        this.pageSize = res.pageSize;
        this.updatePagedData({ skip: res.skip, limit: res.limit });
      }
    });
  }

  ngOnDestroy(): void {
    this.pageSizeSub?.unsubscribe();
    this.contactsSub?.unsubscribe();
  }

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

    this.contactsSub?.unsubscribe();
    const request = this.filterAudienceId ? this.audienceService.contacts(this.filterAudienceId) : this.contactDetailsService.getContactDetails();
    this.contactsSub = request.subscribe({
      next: (apiRes: any) => {
        const success = [200, 204].includes(Number(apiRes?.responseCode));
        this.allTableData = success ? apiRes?.listPayload || [] : [];
        if (!success) this.messageService.add({ severity: 'error', summary: 'Contacts', detail: apiRes?.responseMessage || 'Could not load contacts.' });
        this.totalData = apiRes?.totalNumber || this.allTableData.length;

        this.dataSource = new MatTableDataSource<any>(this.allTableData);

        this.searchData(this.searchDataValue);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.allTableData = [];
        this.tableData = [];
        this.dataSource = new MatTableDataSource<any>([]);
        this.updatePagedData({ skip: 0, limit: this.pageSize });
        this.messageService.add({ severity: 'error', summary: 'Contacts', detail: 'Could not load contacts. Please try again.' });
      }
    });
  }

  updatePagedData(pageOption: pageSelection): void {
    const sourceData = this.dataSource.filteredData;

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
    const data = [...this.allTableData];

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
    const filterValue = JSON.stringify({ search: value.trim().toLowerCase(), status: this.statusFilter });

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const criteria = JSON.parse(filter);
      filter = criteria.search;
      return (!criteria.status || data.status === criteria.status) && (
        (data.emailId || '').toLowerCase().includes(filter) ||
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

  public resetSearch(): void {
    this.searchDataValue = '';
    this.statusFilter = '';
    this.filterAudienceId = null;
    this.loadContactDetails();
  }

  public getContactsWith(field: string): number {
    return this.allTableData.filter((contact: any) => !!contact?.[field]).length;
  }

  public getActiveContacts(): number {
    return this.allTableData.filter((contact: any) => contact?.status === 'ACTIVE').length;
  }

  public getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  toggleCollapse(): void {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  openFilter(): void {
    this.filter = !this.filter;
  }

  openAddModal(templateRef: TemplateRef<any>) {
      this.targetAudienceId = this.filterAudienceId;
      this.addContactForm.reset();
      this.audienceError = '';
      this.loadAudiences();
      this.addContactDialog = this.dialog.open(templateRef, {
        width: '880px',
        maxWidth: 'calc(100vw - 32px)',
        disableClose: true,
        panelClass: 'custom-modal',
      });
    }

  public saveContactDetails(): void {
    if (this.audienceBusy || this.audiencesLoading) return;
    if (!this.targetAudienceId) {
      this.messageService.add({ severity: 'error', summary: 'Add Contact', detail: 'Choose an audience for this contact.' });
      return;
    }
    if (this.addContactForm.invalid) {
      this.addContactForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Add Contact', detail: 'Please complete all required fields with valid values.' });
      return;
    }
    this.audienceBusy = true; this.audienceError = '';
    this.contactDetailsService.saveContactDetails({
      ...this.addContactForm.value,
      audienceId: this.targetAudienceId,
    }).subscribe({ next: r => {
      this.audienceBusy = false;
      if (Number(r.responseCode) !== 200 || Number(r.payload?.respCode) !== 200) {
        this.audienceError = r.payload?.respMesg || r.responseMessage || 'Could not save contact.';
        this.messageService.add({ severity: 'error', summary: 'Add Contact', detail: this.audienceError });
        return;
      }
      this.addContactForm.reset(); this.addContactDialog.close(); this.loadContactDetails();
      this.messageService.add({ severity: 'success', summary: 'Contact saved', detail: 'Contact added to the selected audience.' });
    }, error: error => {
      this.audienceBusy = false;
      this.audienceError = error.error?.payload?.respMesg || error.error?.responseMessage || 'Could not save contact. Please try again.';
      this.messageService.add({ severity: 'error', summary: 'Add Contact', detail: this.audienceError });
    } });
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
    this.contactDetailsService.updateContactDetails(this.editContactForm.value)
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
isUploadingAudience = false;
selectedFileName: string = '';

removeSelectedFile(input: HTMLInputElement): void {
  if (this.isUploadingAudience) return;
  this.selectedFile = null;
  this.selectedFileName = '';
  this.uploadError = '';
  input.value = '';
}

onFileChange(event: any): void {
  const file = event.target.files[0];

  if (file) {
    const allowedExtensions = ['xls', 'xlsx'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      this.messageService.add({ severity: 'error', summary: 'Upload Excel', detail: 'Please select a valid Excel file (.xls or .xlsx).' });
      event.target.value = '';
      this.selectedFile = null;
      this.selectedFileName = '';
      return;
    }

    this.uploadError = '';
    this.selectedFile = file;
    this.selectedFileName = file.name;

  }
}

openUploadModal(template: TemplateRef<any>): void {
  this.uploadAudienceId = this.filterAudienceId;
  this.selectedFile = null;
  this.selectedFileName = '';
  this.uploadError = '';
  this.loadAudiences();
  this.uploadDialog = this.dialog.open(template, { width: '560px', maxWidth: 'calc(100vw - 24px)', disableClose: true, ariaLabelledBy: 'upload-title' });
}

uploadFile(): void {
  if (this.isUploadingAudience || this.audienceBusy || this.audiencesLoading) return;
  if (!this.uploadAudienceId || !this.selectedFile) {
    this.messageService.add({ severity: 'error', summary: 'Upload Excel', detail: 'Select an audience and an Excel file first.' });
    return;
  }
  this.uploadError = '';
  this.isUploadingAudience = true;
  this.contactDetailsService.uploadExcel(this.selectedFile, this.uploadAudienceId).subscribe({
    next: message => {
      this.isUploadingAudience = false;
      this.messageService.add({ severity: 'success', summary: 'Upload Excel', detail: message });
      this.uploadDialog?.close();
      this.loadContactDetails();
      this.selectedFile = null;
      this.selectedFileName = '';
    },
    error: error => {
      this.isUploadingAudience = false;
      this.uploadError = typeof error.error === 'string' ? error.error : 'File upload failed. Please try again.';
    },
  });
}

}
