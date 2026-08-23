import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';


@Injectable({
  providedIn: 'root'
})
export class SchoolReceiptListService {

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

  getReceiptDetails(studentSearchForm:any) {
	const currentUser = this.authenticationService.getLoginUser();
	const token = currentUser?.token || this.cookieService.get('token');
	const tenantId = currentUser?.superadminId
	  || currentUser?.superAdminId
	  || currentUser?.loginId
	  || this.cookieService.get('superadminId')
	  || this.cookieService.get('loginId');
  const request: any = {
    payload: {
	  admissionNo: studentSearchForm.admissionNo || undefined,
	  academicSession: studentSearchForm.academicSession || undefined,
	  grade: studentSearchForm.grade || undefined,
	  gradeSection: studentSearchForm.gradeSection || undefined,
	  studentName: studentSearchForm.studentName || undefined,
	  rollNumber: studentSearchForm.rollNumber || undefined,
	  receiptNumber: studentSearchForm.receiptNumber || undefined,
	  superadminId: tenantId
    }
  };
	const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
	return this.http.post<any>(Constant.Site_Url + "getReceiptDetails", request, options);
}


  }

