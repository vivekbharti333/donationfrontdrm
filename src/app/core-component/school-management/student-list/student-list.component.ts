import { Component, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SchoolManagementService } from '../school-management.service';
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

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent {

  public loginUser: any;
  public editStudentForm!: FormGroup;
  public studentUpdateDialog: any;
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
    private schoolManagementService: SchoolManagementService,
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
    this.getUserDetails();
    this.createForms();
  }

  createForms() {
    this.editStudentForm = this.fb.group({
      // Student Basic Details
      id: [''],
      admissionNo: ['', [Validators.required, Validators.pattern('[0-9A-Za-z ]{3,150}')]],
      rollNumber: ['', [Validators.required, Validators.pattern('[0-9A-Za-z ]{1,100}')]],
      studentPicture: [''],
      grade: ['', Validators.required],
      gradeSection: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      dob: [''],
      dobPlace: [''],
      gender: [''],
      bloodGroup: [''],
      nationality: [''],
      category: [''],
      religion: [''],
      aadharNumber: ['', Validators.pattern('[0-9]{12}')],
      birthCertificateNumber: [''],
      permanentEducationNumber: [''],
      eShikshaUniqueId: [''],
      sessionName: [''],
      siblingAdmissionNumber: [''],

      // Parent Details
      fatherName: ['', Validators.required],
      fatherMobileNo: ['', Validators.pattern('[0-9]{10}')],
      motherName: [''],
      motherMobileNo: ['', Validators.pattern('[0-9]{10}')],

      // Current Address
      currentAddress: [''],
      currentCity: [''],
      currentState: [''],
      currentPin: ['', Validators.pattern('[0-9]{6}')],

      // Permanent Address
      permanentAddress: [''],
      permanentCity: [''],
      permanentState: [''],
      permanentPin: ['', Validators.pattern('[0-9]{6}')],

      // Previous School Details
      previousSchool: [''],
      reasonForChange: [''],
      lastClassAttended: [''],

      // Audit (usually hidden / auto-filled)
      createdBy: [''],
      createdByName: [''],
      superadminId: ['']

    });
  }

  public getUserDetails(): void {
    this.serialNumberArray = []; // Clear serial number array before fetching new data

    this.schoolManagementService.getStudentDetails().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber; // Set total data count
      this.fullData = apiRes.listPayload;  // Store the full dataset

      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.studentsList) {
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

  changeUserStatus(userId: string): void {
    const statusData = {
      userId: userId,
      
    };
  }

  confirmColor(userId: string) {

  }

  openEditModal(templateRef: TemplateRef<any>, rawData: any): void {

    this.editStudentForm.patchValue({

      // Basic Identifiers
      id: rawData['id'],
      admissionNo: rawData['admissionNo'],
      rollNumber: rawData['rollNumber'],

      // Student Basic Details
      studentPicture: rawData['studentPicture'],
      grade: rawData['grade'],
      gradeSection: rawData['gradeSection'],
      firstName: rawData['firstName'],
      middleName: rawData['middleName'],
      lastName: rawData['lastName'],
      dob: rawData['dob'],
      dobPlace: rawData['dobPlace'],
      gender: rawData['gender'],
      bloodGroup: rawData['bloodGroup'],
      nationality: rawData['nationality'],
      category: rawData['category'],
      religion: rawData['religion'],
      aadharNumber: rawData['aadharNumber'],
      birthCertificateNumber: rawData['birthCertificateNumber'],
      permanentEducationNumber: rawData['permanentEducationNumber'],
      eShikshaUniqueId: rawData['eShikshaUniqueId'],
      sessionName: rawData['sessionName'],
      siblingAdmissionNumber: rawData['siblingAdmissionNumber'],

      // Parent Details
      fatherName: rawData['fatherName'],
      fatherMobileNo: rawData['fatherMobileNo'],
      motherName: rawData['motherName'],
      motherMobileNo: rawData['motherMobileNo'],

      // Current Address
      currentAddress: rawData['currentAddress'],
      currentCity: rawData['currentCity'],
      currentState: rawData['currentState'],
      currentPin: rawData['currentPin'],

      // Permanent Address
      permanentAddress: rawData['permanentAddress'],
      permanentCity: rawData['permanentCity'],
      permanentState: rawData['permanentState'],
      permanentPin: rawData['permanentPin'],

      // Previous School Details
      previousSchool: rawData['previousSchool'],
      reasonForChange: rawData['reasonForChange'],
      lastClassAttended: rawData['lastClassAttended'],

      // Audit Fields (if editable / hidden)
      createdBy: rawData['createdBy'],
      createdByName: rawData['createdByName'],
      superadminId: rawData['superadminId']
    });


    this.studentUpdateDialog = this.dialog.open(templateRef, {
      width: '1400px',
      disableClose: true,
      panelClass: 'custom-modal',
    });
  }


  updateStudentForm() {
    this.schoolManagementService.updateStudent(this.editStudentForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.editStudentForm.reset();
              this.createForms();

            } else if (response['payload']['respCode'] == '401') {

              this.cookieService.delete('loginDetails');
              window.location.href = "/login";
              window.location.reload();

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
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
        error: (error: any) => this.messageService.add({
          summary: '500', detail: 'Server Error', styleClass: 'danger-background-popover',
        })
      });
  }

}