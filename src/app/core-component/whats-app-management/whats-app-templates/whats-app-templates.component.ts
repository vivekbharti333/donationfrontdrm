import { Component, importProvidersFrom, TemplateRef, HostListener } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
// import { MatDialogRef } from '@angular/material/dialog';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { Constant } from 'src/app/core/constant/constants';
import { DonationDetails, DonationListForExcel } from '../../interface/donation-management';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CustomPaginationComponent } from 'src/app/shared/custom-pagination/custom-pagination.component';
import { WhatsAppTemplatesService } from './whats-app-templates.service';

@Component({
  selector: 'app-whats-app-templates',
  templateUrl: './whats-app-templates.component.html',
  styleUrls: ['./whats-app-templates.component.scss']
})
export class WhatsAppTemplatesComponent {

  public editTemplateDialog: any;
  public editTemplateForm!: FormGroup;

// get variablesArray(): FormArray {
//   return this.editTemplateForm.get('msgBodyVariable') as FormArray;
// }


  /* ================= TEMPLATE ================= */


  variables: string[] = [];
  variableValues: Record<string, string> = {};

  selectedVariableType: any;
  showVarDropdown = false;

  selectedMediaType: any;
  showMediaDropdown = false;


  selectedLead: any = null;
  messages: any[] = [];
  newMessage: string = '';

  // pagination variables
  public routes = routes;
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<any>;
  public searchDataValue = '';
  //** / pagination variables


  public lastIndex = 0;
  // public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  // public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public totalPages = 0;

  public fullData: any[] = [];
  public showCustomFilter: boolean = false;


  /* ================= CHAT LOGIC ================= */
  constructor(
    // private dialogRef: MatDialogRef<any>,
    private fb: FormBuilder,
    private sidebar: SidebarService,
    private pagination: PaginationService,
    private dialog: MatDialog,
    private whatsAppTemplatesService: WhatsAppTemplatesService,

  ) {

  }

  ngOnInit() {
    this.getWhatsAppTemplate();
  }

 createForms() {
  this.editTemplateForm = this.fb.group({
    requestFor: [null],
    templateId: [null],
    templateName: [''],

    parameterFormat: ['POSITIONAL'],

    headerFormat: [null],
    headerText: [''],

    msgBodyText: [''],

    // ✅ FIXED STRUCTURE
    msgBodyVariable: this.fb.array([
      this.createVariableGroup(1)
    ]),

    footerText: [''],

    language: ['en'],
    status: [null],
    category: [null],
    sub_category: [null],
    toWhatsAppNumber: [null],

    variableType: ['Name'],
    mediaType: ['None']
  });
}

get msgBodyVariableArray(): FormArray {
  return this.editTemplateForm.get('msgBodyVariable') as FormArray;
}

 // ✅ getter
  get variablesArray(): FormArray {
    return this.editTemplateForm.get('msgBodyVariable') as FormArray;
  }

  // ✅ helper
  createVariableGroup(index: number) {
    return this.fb.group({
      key: `{{${index}}}`,
      value: ''
    });
  }

  addVariable() {
    const index = this.variablesArray.length + 1;
    this.variablesArray.push(this.createVariableGroup(index));
  }

  public getWhatsAppTemplate(): void {
    this.dataSource = new MatTableDataSource<DonationDetails>([]);

    // 🔥 Reset pagination to page 1
    this.pagination.tablePageSize.next({
      skip: 0,
      limit: this.pageSize,
      pageSize: this.pageSize
    });

    // 🔥 API CALL
    this.whatsAppTemplatesService.getWhatsAppTemplate()
      .subscribe((apiRes: any) => {

        // Assign new data
        this.totalData = apiRes.totalNumber || 0;
        this.fullData = apiRes.listPayload || [];

        // Load page 1 immediately
        this.prepareTableData(this.fullData, {
          skip: 0,
          limit: this.pageSize
        });
      });
  }


  dataTableClear() {
    this.showCustomFilter = true;
    this.tableData = [];
    this.pageSize = 10;
    this.serialNumberArray = [];
    this.totalData = 0;
    this.showFilter = false;

  }

  private prepareTableData(apiRes: DonationDetails[], pageOption: pageSelection): void {
    const start = pageOption.skip;
    const end = pageOption.limit;

    this.dataSource = new MatTableDataSource<DonationDetails>([]);

    // Slice data for current page
    this.tableData = apiRes.slice(start, end);

    // Serial numbers (1-based)
    this.serialNumberArray = this.tableData.map((_, i) => start + i + 1);

    // Material table
    this.dataSource = new MatTableDataSource<DonationDetails>(this.tableData);

    // Notify pagination service
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
      // Filter data
      const filteredData = this.fullData.filter((donation: DonationDetails) =>
        Object.values(donation).some((field: any) =>
          String(field).toLowerCase().includes(searchTerm)
        )
      );

      this.totalData = filteredData.length;

      // Always reset to page 1
      this.prepareTableData(filteredData, { skip: 0, limit: this.pageSize });
    } else {
      // Search cleared → reset table & page to page 1
      this.totalData = this.fullData.length;

      this.prepareTableData(this.fullData, { skip: 0, limit: this.pageSize });

      // Reset pagination to page 1
      this.pagination.tablePageSize.next({
        skip: 0,
        limit: this.pageSize,
        pageSize: this.pageSize
      });
    }
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
  ///////////////////

  // selectLead(lead: any) {
  //   this.selectedLead = lead;
  //   this.messages = lead.messages;
  // }

  sendMessage() {
    if (!this.newMessage) return;

    this.messages.push({
      text: this.newMessage,
      direction: 'OUTGOING',
      time: 'Now'
    });

    this.newMessage = '';
  }

  /* ================= TEMPLATE LOGIC ================= */

 onBodyChange() {
  this.detectVariables();
}

detectVariables() {
  const text = this.editTemplateForm.get('msgBodyText')?.value || '';

  const matches = text.match(/{{\d+}}/g); // only {{1}}, {{2}}

  const formArray = this.variablesArray;

  // ✅ clear existing variables
  formArray.clear();

  if (!matches) return;

  // ✅ unique variables
  const unique = [...new Set(matches)] as string[];

 unique.forEach((v: string) => {
  formArray.push(
    this.fb.group({
      key: v,
      value: ''
    })
  );
});
}

getPreviewText(): string {
  let text = this.editTemplateForm.get('msgBodyText')?.value || '';

  const variables = this.variablesArray.value;

  variables.forEach((v: any) => {
    const value = v.value || v.key;
    text = text.replaceAll(v.key, value);
  });

  return text;
}

  // addVariable() {
  //   const variable =
  //     this.selectedVariableType === 'Number' ? '{{1}}' : '{{name}}';

  //   this.template.body += ' ' + variable;
  //   this.detectVariables();
  // }

  /* ================= DROPDOWN ================= */

toggleVarDropdown(event: Event) {
  event.stopPropagation(); // 🔥 THIS IS THE MAIN FIX

  this.showVarDropdown = !this.showVarDropdown;
  this.showMediaDropdown = false;
}

  selectVariableType(type: any) {
    this.selectedVariableType = type;
    this.showVarDropdown = false;
  }

  toggleMediaDropdown(event: Event) {
  event.stopPropagation(); // same as var dropdown
  this.showMediaDropdown = !this.showMediaDropdown;
  this.showVarDropdown = false;
}

  selectMediaType(type: any) {
    this.selectedMediaType = type;
    this.showMediaDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: any) {
    if (!event.target.closest('.dropdown')) {
      this.showVarDropdown = false;
      this.showMediaDropdown = false;
    }
  }

  submitTemplate() {
    
   
  }


openEditModal(templateRef: TemplateRef<any>, data: any) {

  this.createForms();

  this.editTemplateForm.patchValue({
    requestFor: data.requestFor,
    templateId: data.templateId,
    templateName: data.templateName,
    parameterFormat: data.parameterFormat,
    headerFormat: data.headerFormat,
    headerText: data.headerText,
    msgBodyText: data.msgBodyText,
    footerText: data.footerText,
    language: data.language,
    status: data.status,
    category: data.category,
    sub_category: data.sub_category,
    toWhatsAppNumber: data.toWhatsAppNumber
  });

  // ✅ FIX HERE
  this.variablesArray.clear();

  data.msgBodyVariable?.forEach((v: any) => {
    this.variablesArray.push(
      this.fb.group({
        variableType: [v.variableType || 'Name'],
        bodyVariable: [v.bodyVariable || '']
      })
    );
  });

  this.editTemplateDialog = this.dialog.open(templateRef, {
    width: '1400px',
    disableClose: true,
    panelClass: 'custom-modal',
  });
}


public deleteTemplateByName(templateName: string) {
    this.whatsAppTemplatesService.deleteWhatsAppTemplateByName(templateName)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.getWhatsAppTemplate();
            // this.toastr.success(response['responseMessage'], response['responseCode']);
          } else {
            //  this.toastr.error(response['responseMessage'], response['responseCode']);
          }
        },
        //error: (error: any) => this.toastr.error('Server Error', '500'),
      });
  }

}