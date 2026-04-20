import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppTemplatesService {

 public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getWhatsAppTemplate(): Observable<any> {
      let request: any = {
        payload: {
          "requestFor": "ALL",
          // createdBy: this.loginUser['loginId'],
          // roleType: this.loginUser['roleType'],
          // loginId: this.loginUser['loginId'],
          // token: this.loginUser['token'],
          // superadminId: this.loginUser['superadminId'],
  
        }
      };
      return this.http.post<any>(Constant.Site_Url + "getWhatsAppTemplate", request);
    }
}
