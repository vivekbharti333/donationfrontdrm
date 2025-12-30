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

  getReceiptDetails() {
  const request: any = {
    payload: {
      // superadminId: this.loginUser['superadminId'],   // e.g. "SA001"
      superadminId: "SA001", 
      academicSession: "2024-2025",
      grade: "10",
      gradeSection: "A",
      studentName: "Rahul",
      rollNumber: "15"
    }
  };

  return this.http.post<any>(Constant.Site_Url + "getReceiptDetails", request);
}


  }

