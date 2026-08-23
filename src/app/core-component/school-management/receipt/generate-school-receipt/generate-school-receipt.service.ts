import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { SchoolManagementService } from '../../school-management.service';


@Injectable({
  providedIn: 'root'
})
export class GenerateSchoolReceiptService {

 public loginUser: any;
  public details = false;

   constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private schoolManagementService: SchoolManagementService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();

    const details = this.cookieService.get('loginDetails');

  if (details) {

    this.loginUser = JSON.parse(details);

  }
  }

  submitReceipt(receiptDetasils: any): Observable<any> {

  this.loginUser = this.authenticationService.getLoginUser();

  // get raw values (important: includes disabled fields)
  // const formValue = this.receiptForm.getRawValue();

  const request = {
    payload: {

      // ===== Student Info =====
      admissionNo: receiptDetasils.admissionNo,
      studentId: receiptDetasils.studentId,
      studentAcademicId: receiptDetasils.studentAcademicId,
      rollNumber: receiptDetasils.rollNumber,
      studentName: receiptDetasils.studentName,
      fatherName: receiptDetasils.fatherName,
      fatherMobileNo: receiptDetasils.contactNo,
      grade: receiptDetasils.grade,
      gradeSection: receiptDetasils.gradeSection,
      academicSession: receiptDetasils.academicSession,

      // ===== Receipt Info =====
      receiptNumber: receiptDetasils.receiptNumber,
      installmentName: receiptDetasils.installmentName,
      paymentMode: receiptDetasils.paymentMode,
      paymentDate: receiptDetasils.paymentDate,

      // ===== Fee Details =====
      receiptDetails: receiptDetasils.receiptDetails,

      // ===== Amount Summary =====
      totalAmount: receiptDetasils.totalAmount,
      discountAmount: receiptDetasils.discountAmount,
      fineAmount: receiptDetasils.fineAmount,
      netAmount: receiptDetasils.netAmount,

      // ===== System Fields =====
      createdBy: this.cookieService.get('userId'),
      token: this.cookieService.get('token'),
      superadminId: this.cookieService.get('superadminId'),
    }
  };

  return this.http.post<any>(Constant.Site_Url + "submitReceipt", request);
}

getStudentDetailsForFee( grade: string, gradeSection: string): Observable<any> {
    const request = {
      payload: {
        // requestFor: 'FOR_FEE',
        requestFor: 'ALL',
        grade: grade,
        gradeSection: gradeSection,
        createdBy: this.loginUser?.userId,
        token: this.loginUser?.token,
        superadminId: this.loginUser?.superadminId
        // superadminId: 'SA001'
        // superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getStudentDetails", request);
  }

  getGradeDetails(): Observable<any> {
    return this.schoolManagementService.getGradeDetails();
  }

  getInvoiceHeaderList(): Observable<any> {
    const currentUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        requestFor: 'BYSUPERADMINID',
        token: currentUser?.token || this.cookieService.get('token'),
        createdBy: currentUser?.loginId || this.cookieService.get('loginId'),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    return this.http.post<any>(Constant.Site_Url + 'getInvoiceHeaderList', request);
  }

  getStudentAcademicDetails(filters: {
    sessionName: string;
    grade: string;
    gradeSection: string;
  }): Observable<any> {
    return this.schoolManagementService.getStudentAcademicDetails(filters);
  }

  getAssignedFeeToStudentDetails(studentId: number, sessionName: string): Observable<any> {
    return this.schoolManagementService.getAssignedFeeToStudentDetails(studentId, sessionName);
  }

}
