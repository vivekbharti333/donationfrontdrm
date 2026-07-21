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

  // ================= RESET PASSWORD =================
// ================= RESET PASSWORD FLOW =================

setOtpSent(status: boolean): void {
  sessionStorage.setItem('otpSent', String(status));
}

isOtpSent(): boolean {
  return sessionStorage.getItem('otpSent') === 'true';
}

setOtpVerified(status: boolean): void {
  sessionStorage.setItem('otpVerified', String(status));
}

isOtpVerified(): boolean {
  return sessionStorage.getItem('otpVerified') === 'true';
}

setPasswordReset(status: boolean): void {
  sessionStorage.setItem('passwordReset', String(status));
}

isPasswordReset(): boolean {
  return sessionStorage.getItem('passwordReset') === 'true';
}

setResetMobileNo(mobileNo: string): void {
  sessionStorage.setItem('resetMobileNo', mobileNo);
}

getResetMobileNo(): string | null {
  return sessionStorage.getItem('resetMobileNo');
}

clearResetFlow(): void {
  sessionStorage.removeItem('otpSent');
  sessionStorage.removeItem('otpVerified');
  sessionStorage.removeItem('passwordReset');
  sessionStorage.removeItem('resetMobileNo');
}

}