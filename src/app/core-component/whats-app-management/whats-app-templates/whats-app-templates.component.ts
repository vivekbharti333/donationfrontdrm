import { Component, importProvidersFrom, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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

  /* ================= TEMPLATE ================= */
  template = {
    name: '',
    language: 'English',
    header: '',
    body: '',
    footer: ''
  };

  variables: string[] = [];
  variableValues: Record<string, string> = {};

  selectedVariableType: any = 'Name';
  showVarDropdown = false;

  selectedMediaType: any = 'None';
  showMediaDropdown = false;

  /* ================= CHAT DATA ================= */

  leads = [
    {
      id: 1,
      name: 'Rahul Sharma',
      lastMessage: 'Yes interested',
      messages: [
        { text: 'Hello', direction: 'OUTGOING', time: '12:30 PM' },
        { text: 'Yes interested', direction: 'INCOMING', time: '12:31 PM' }
      ]
    },
    {
      id: 2,
      name: 'NGO XYZ',
      lastMessage: 'Hello',
      messages: [
        { text: 'Hi', direction: 'OUTGOING', time: '10:00 AM' },
        { text: 'Hello', direction: 'INCOMING', time: '10:01 AM' }
      ]
    }
  ];

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
    private sidebar: SidebarService,
    private pagination: PaginationService,
    private dialog: MatDialog,
    private whatsAppTemplatesService: WhatsAppTemplatesService,

  ) {

  }

  ngOnInit() {
    this.getWhatsAppTemplate("h")
  }

  public getWhatsAppTemplate(tabName: string): void {
    // this.showCustomFilter = false;
    // this.tabName = tabName;

    // 🔥 CLEAR OLD DATA BEFORE API CALL
    this.tableData = [];
    this.fullData = [];
    this.serialNumberArray = [];
    this.totalData = 0;

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

  selectLead(lead: any) {
    this.selectedLead = lead;
    this.messages = lead.messages;
  }

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
    const text = this.template.body || '';
    const matches = text.match(/{{(.*?)}}/g);

    if (!matches) {
      this.variables = [];
      return;
    }

    const unique = [...new Set(matches)];
    this.variables = unique;

    unique.forEach(v => {
      if (!this.variableValues[v]) {
        this.variableValues[v] = '';
      }
    });
  }

  getPreviewText() {
    let text = this.template.body || '';

    this.variables.forEach(v => {
      const value = this.variableValues[v] || v;
      text = text.replaceAll(v, value);
    });

    return text;
  }

  addVariable() {
    const variable =
      this.selectedVariableType === 'Number' ? '{{1}}' : '{{name}}';

    this.template.body += ' ' + variable;
    this.detectVariables();
  }

  /* ================= DROPDOWN ================= */

  toggleVarDropdown() {
    this.showVarDropdown = !this.showVarDropdown;
    this.showMediaDropdown = false;
  }

  selectVariableType(type: any) {
    this.selectedVariableType = type;
    this.showVarDropdown = false;
  }

  toggleMediaDropdown() {
    this.showMediaDropdown = !this.showMediaDropdown;
    this.showVarDropdown = false;
  }

  selectMediaType(type: any) {
    this.selectedMediaType = type;
    this.showMediaDropdown = false;
  }

  // @HostListener('document:click', ['$event'])
  // closeDropdown(event: any) {
  //   if (!event.target.closest('.dropdown')) {
  //     this.showVarDropdown = false;
  //     this.showMediaDropdown = false;
  //   }
  // }

  submitTemplate() {
    console.log('FINAL DATA:', {
      ...this.template,
      variables: this.variableValues
    });
  }



  openEditModal(templateRef: TemplateRef<any>, rowData: any) {

    this.editTemplateDialog = this.dialog.open(templateRef, {
      width: '1400px', // Set your desired width
      // height: '600px', // Set your desired height
      disableClose: true, // Optional: prevent closing by clicking outside
      panelClass: 'custom-modal', // Optional: add custom class for additional styling
    });

  }
}