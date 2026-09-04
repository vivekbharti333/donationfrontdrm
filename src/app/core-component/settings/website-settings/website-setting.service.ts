import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class WebsiteSettingService {

  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getUserDetailsForCompanySettings(): Observable<any> {
    const loginUser = this.authenticationService.getLoginUser() || {};
    const loginId = loginUser['loginId'] || this.cookieService.get('loginId');
    const superadminId = loginUser['superadminId'] || this.cookieService.get('superadminId');
    const roleType = loginUser['roleType'] || this.cookieService.get('roleType');
    const request = {
      payload: {
        requestedFor: 'ALL',
        roleType,
        token: loginUser['token'] || this.cookieService.get('token'),
        createdBy: loginId,
        superadminId
      }
    };
    return this.http.post<any>(Constant.Site_Url + 'getUserDetails', request);
  }

  saveCompanyDetails(comapny: any, selectedSuperadminId?: string): Observable<any> {
    let request: any = {
      payload: {
        loginPageWallpaper : comapny.loginPageWallpaper,
        loginPageLogo: comapny.loginPageLogo,
        ipAddress: comapny.ipAddress,
        displayLogo: comapny.displayLogo,
        displayName: comapny.displayName,
        emailId: comapny.emailId,
        website: comapny.website,
        phoneNumber: comapny.phoneNumber,
        service: this.loginUser['service'] || this.cookieService.get('service'),
        token: this.loginUser['token'],
        superadminId: selectedSuperadminId || this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addUpdateApplicationHeader", request);
  }

  getApplicationDetailsList(selectedSuperadminId?: string): Observable<any> {
    let request: any = {
      payload: {
        token: this.loginUser['token'],
        superadminId: selectedSuperadminId || this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getApplicationHeaderDetails", request);
  }
}
