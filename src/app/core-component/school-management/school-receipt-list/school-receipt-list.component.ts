import { Component, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SchoolReceiptListService } from './school-receipt-list.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { pageSelection, SidebarService } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { UserDetails } from '../../interface/user-management';
import { MatDialog } from '@angular/material/dialog';
import { GenerateSchoolReceiptService } from '../generate-school-receipt/generate-school-receipt.service'; 

@Component({
  selector: 'app-school-receipt-list',
  templateUrl: './school-receipt-list.component.html',
  styleUrl: './school-receipt-list.component.scss'
})
export class SchoolReceiptListComponent {

  studentSearchForm!: FormGroup;
  receiptForm!: FormGroup;
  // receiptDetails!: FormGroup;
  selectedStudent: any;
  studentDetails: any[] = [];
  isLoading = true;

  public loginUser: any;
  // public editStudentForm!: FormGroup;
  public receiptDialog: any;
  public fullData: any[] = [];
  public routes = routes;

  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 2;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<any>;
  public searchDataValue = '';
  // pagination variables


  constructor(
    private fb: FormBuilder,
    private sidebar: SidebarService,
    private schoolReceiptListService: SchoolReceiptListService,
    private generateSchoolReceiptService: GenerateSchoolReceiptService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private cookieService: CookieService,

    private pagination: PaginationService,
    private router: Router,
    private dialog: MatDialog,

  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    // this.getReceiptDetails();
    this.createSearchForm();
    this.createReceiptForm();
  }

     createSearchForm(): void {
    this.studentSearchForm = this.fb.group({
      // Search Info
      admissionNo: [''],
      grade: [''],
      gradeSection: [''],
      academicSession: ['2026-2027'],
    });

  }

  createReceiptForm(): void {
    this.receiptForm = this.fb.group({
    receiptNumber: [''],
    admissionNo: [''],
    rollNumber: [''],
    studentName: [''],
    grade: [''],
    gradeSection: [''],
    academicSession: [''],
    installmentName: [''],
    paymentMode: [''],
    paymentDate: [''],
    totalAmount: [''],
    discountAmount: [''],
    fineAmount: [''],
    netAmount: [''],
    status: [''],
    createdBy:  [''],
    createdByName: [''],
    superadminId: [''],

     // FormArray
    receiptDetails: this.fb.array([])

    });
  }

  get receiptDetails(): FormArray {

  return this.receiptForm.get(
    'receiptDetails'
  ) as FormArray;
}

createReceiptDetailGroup(data?: any): FormGroup {

  return this.fb.group({

    feeType: [data?.feeType || ''],

    amount: [data?.amount || 0]

  });
}

    public getReceiptDetails(studentDetails:any): void {

    this.studentSearchForm.patchValue({
    admissionNo: studentDetails.admissionNo,
   });
      this.serialNumberArray = []; // Clear serial number array before fetching new data
  
      this.schoolReceiptListService.getReceiptDetails(this.studentSearchForm.value).subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber; // Set total data count
        this.fullData = apiRes.listPayload;  // Store the full dataset
  
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url === this.routes.schoolReceiptList) {
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

    confirmColor(userId: string) {

  }

  openEditModal(templateRef: TemplateRef<any>, rawData: any): void {

    // Patch normal form values
    this.receiptForm.patchValue({

      receiptNumber: rawData.receiptNumber,
      admissionNo: rawData.admissionNo,
      rollNumber: rawData.rollNumber,
      studentName: rawData.studentName,
      grade: rawData.grade,
      gradeSection: rawData.gradeSection,
      academicSession: rawData.academicSession,
      installmentName: rawData.installmentName,
      paymentMode: rawData.paymentMode,
      paymentDate: rawData.paymentDate,
      totalAmount: rawData.totalAmount,
      discountAmount: rawData.discountAmount,
      fineAmount: rawData.fineAmount,
      netAmount: rawData.netAmount,
      status: rawData.status,
      createdBy: rawData.createdBy,
      createdByName: rawData.createdByName,
      superadminId: rawData.superadminId
    });

    // Clear old FormArray
    this.receiptDetails.clear();

    // Add new receipt details
    rawData.receiptDetails.forEach((item: any) => {

      this.receiptDetails.push(this.createReceiptDetailGroup(item)
      );
    });

    // Open modal
    this.receiptDialog = this.dialog.open(templateRef, {

      width: '100%',
      maxWidth: '900px',
      height: '90vh',
      disableClose: true,
      panelClass: 'custom-modal'

    });
  }

  printReceipt() {
    window.print();
  }


asFormGroup(control: any): FormGroup {

  return control as FormGroup;
}



getStudentDetails() {

  const grade = this.studentSearchForm.get('grade')?.value;
  const gradeSection = this.studentSearchForm.get('gradeSection')?.value;

  if (!grade || !gradeSection) {
    this.studentDetails = [];
    return;
  }

  this.isLoading = true;
  this.generateSchoolReceiptService.getStudentDetailsForFee(grade, gradeSection)
    .subscribe({
      next: (res) => {
         this.studentDetails = res?.listPayload || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
}

submitSearch(){

}
  



}
