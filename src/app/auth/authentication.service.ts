import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
// import { UserDetailsRequest } from '../interface/user-management';
import { Constant } from '../core/constant/constants';


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


  logOut() {
    this.cookieService.delete('loginDetails');
  }

}
