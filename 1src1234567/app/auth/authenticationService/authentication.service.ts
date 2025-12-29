import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { UserDetailsRequest } from 'src/app/core-component/interface/user-management'; 
import { Constant } from 'src/app/core/constant/constants'; 


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public loginUser: any;

  public details = false;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {
    this.loginUser = this.getLoginUser();
  }

  getLoginUser() {
    let details = this.cookieService.get('loginDetails');
    if (details) {
      return JSON.parse(details);
    } else {
      return { 'userId': '', 'fullName': '', 'mobileNo': '', 'memberType': '' };
    }
  }

  isLogin() {
    let details = this.cookieService.get('loginDetails');
    if (details) {
      return true;
    } else {
      return false;
    }
  }



  logOut() {
    this.cookieService.delete('loginDetails');
  }


  getUserDetailsByLoginId(): Observable<UserDetailsRequest> {
    let request: UserDetailsRequest = {
      payload: {
        loginId: this.loginUser['loginId'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<UserDetailsRequest>(Constant.Site_Url + "getUserDetailsByLoginId", request);
  }

  getApplicationDetailsBySuperadminId(): Observable<UserDetailsRequest> {
    let request: UserDetailsRequest = {
      payload: {
        loginId: this.loginUser['loginId'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<UserDetailsRequest>(Constant.Site_Url + "getApplicationHeaderDetailsBySuperadminId", request);
  }


}

