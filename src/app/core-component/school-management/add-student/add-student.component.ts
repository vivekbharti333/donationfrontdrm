import { Component } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import { SidebarService } from 'src/app/core/core.index'; // Ensure correct import path
import { SchoolManagementService } from '../school-management.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.scss',
   providers: [MessageService, ToastModule],
})
export class AddStudentComponent {
public loginUser: any;
 public addStudentForm!: FormGroup;

    constructor(
      private fb: FormBuilder,
      private sidebar: SidebarService,
      private schoolManagementService: SchoolManagementService,
      private authenticationService: AuthenticationService,
      private messageService: MessageService,
      private cookieService: CookieService,
    ) 
    {
      this.loginUser = this.authenticationService.getLoginUser();
    }

      ngOnInit() {

    this.createForms();
   
  }

  createForms() {
  this.addStudentForm = this.fb.group({

    // Student Basic Details
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

  submitStudentForm() {
    this.schoolManagementService.addStudent(this.addStudentForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.addStudentForm.reset();
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
