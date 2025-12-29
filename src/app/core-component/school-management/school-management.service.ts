import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SchoolManagementService {

  public loginId: any;
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  addStudent(studentDetails: any): Observable<any> {

    const request: any = {
      payload: {
        // Auth / audit
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('superadminId'),
        createdByName: this.cookieService.get('superadminName'),
        superadminId: this.cookieService.get('superadminId'),

        // Student Basic Details
        admissionNo: studentDetails.admissionNo,
        rollNumber: studentDetails.rollNumber,
        studentPicture: studentDetails.studentPicture,
        grade: studentDetails.grade,
        gradeSection: studentDetails.gradeSection,
        firstName: studentDetails.firstName,
        middleName: studentDetails.middleName,
        lastName: studentDetails.lastName,
        dob: studentDetails.dob,
        dobPlace: studentDetails.dobPlace,
        gender: studentDetails.gender,
        bloodGroup: studentDetails.bloodGroup,
        nationality: studentDetails.nationality,
        category: studentDetails.category,
        religion: studentDetails.religion,
        aadharNumber: studentDetails.aadharNumber,
        birthCertificateNumber: studentDetails.birthCertificateNumber,
        permanentEducationNumber: studentDetails.permanentEducationNumber,
        eShikshaUniqueId: studentDetails.eShikshaUniqueId,
        sessionName: studentDetails.sessionName,
        siblingAdmissionNumber: studentDetails.siblingAdmissionNumber,

        // Parent Details
        fatherName: studentDetails.fatherName,
        fatherMobileNo: studentDetails.fatherMobileNo,
        motherName: studentDetails.motherName,
        motherMobileNo: studentDetails.motherMobileNo,

        // Current Address
        currentAddress: studentDetails.currentAddress,
        currentCity: studentDetails.currentCity,
        currentState: studentDetails.currentState,
        currentPin: studentDetails.currentPin,

        // Permanent Address
        permanentAddress: studentDetails.permanentAddress,
        permanentCity: studentDetails.permanentCity,
        permanentState: studentDetails.permanentState,
        permanentPin: studentDetails.permanentPin,

        // Previous School
        previousSchool: studentDetails.previousSchool,
        reasonForChange: studentDetails.reasonForChange,
        lastClassAttended: studentDetails.lastClassAttended
      }
    };

    return this.http.post<any>(Constant.Site_Url + 'addStudent', request);
  }

  updateStudent(studentDetails: any): Observable<any> {

    const request: any = {
      payload: {
        // Auth / audit
        token: this.cookieService.get('token'),
        // createdBy: this.cookieService.get('superadminId'),
        // createdByName: this.cookieService.get('superadminName'),
        // superadminId: this.cookieService.get('superadminId'),

        // Student Basic Details
        admissionNo: studentDetails.admissionNo,
        rollNumber: studentDetails.rollNumber,
        studentPicture: studentDetails.studentPicture,
        grade: studentDetails.grade,
        gradeSection: studentDetails.gradeSection,
        firstName: studentDetails.firstName,
        middleName: studentDetails.middleName,
        lastName: studentDetails.lastName,
        dob: studentDetails.dob,
        dobPlace: studentDetails.dobPlace,
        gender: studentDetails.gender,
        bloodGroup: studentDetails.bloodGroup,
        nationality: studentDetails.nationality,
        category: studentDetails.category,
        religion: studentDetails.religion,
        aadharNumber: studentDetails.aadharNumber,
        birthCertificateNumber: studentDetails.birthCertificateNumber,
        permanentEducationNumber: studentDetails.permanentEducationNumber,
        eShikshaUniqueId: studentDetails.eShikshaUniqueId,
        sessionName: studentDetails.sessionName,
        siblingAdmissionNumber: studentDetails.siblingAdmissionNumber,

        // Parent Details
        fatherName: studentDetails.fatherName,
        fatherMobileNo: studentDetails.fatherMobileNo,
        motherName: studentDetails.motherName,
        motherMobileNo: studentDetails.motherMobileNo,

        // Current Address
        currentAddress: studentDetails.currentAddress,
        currentCity: studentDetails.currentCity,
        currentState: studentDetails.currentState,
        currentPin: studentDetails.currentPin,

        // Permanent Address
        permanentAddress: studentDetails.permanentAddress,
        permanentCity: studentDetails.permanentCity,
        permanentState: studentDetails.permanentState,
        permanentPin: studentDetails.permanentPin,

        // Previous School
        previousSchool: studentDetails.previousSchool,
        reasonForChange: studentDetails.reasonForChange,
        lastClassAttended: studentDetails.lastClassAttended
      }
    };

    return this.http.post<any>(Constant.Site_Url + 'updateStudent', request);
  }


    getStudentDetails(): Observable<any> {
    let request: any = {
      payload: {
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: 'SA001'
        // superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getStudentDetails", request);
    // return this.http.post<any>(Constant.Site_Url + "getDonationTypeAndAmtListBySuperadminId", request);
  }
}
