import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class EmailSettingsService {
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  addUpdateEmailServiceDetails(emailDetails: any): Observable<any> {
    this.loginUser = this.authenticationService.getLoginUser();
    let request: any = {
      payload: {
        emailType: emailDetails.emailType,
        host: emailDetails.host,
        port: emailDetails.port,
        emailUserid: emailDetails.emailUserid,
        emailPassword: emailDetails.emailPassword,
        emailFrom: emailDetails.emailFrom,
        subject: emailDetails.subject,
        emailBody: emailDetails.emailBody,
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addUpdateEmailServiceDetails", request);
  }

  getEmailServiceDetailsList(): Observable<any> {
    let request: any = {
      payload: {
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getEmailServiceDetailsList", request);
  }
}
