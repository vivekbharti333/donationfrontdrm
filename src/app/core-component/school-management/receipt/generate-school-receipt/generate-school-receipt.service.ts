import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class GenerateSchoolReceiptService {

 public loginUser: any;
  public details = false;

   constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
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
      rollNumber: receiptDetasils.rollNumber,
      studentName: receiptDetasils.studentName,
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

}
