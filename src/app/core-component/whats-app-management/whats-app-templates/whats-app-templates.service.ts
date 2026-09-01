import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppTemplatesService {

 public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
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
          superadminId: this.loginUser['superadminId'],
  
        }
      };
      return this.http.post<any>(Constant.Site_Url + "getWhatsAppTemplate", request);
    }

    deleteWhatsAppTemplateByName(templateName : string): Observable<any> {
      let request: any = {
        payload: {
          "templateName": templateName,  
        }
      };
      return this.http.post<any>(Constant.Site_Url + "deleteWhatsAppTemplateByName", request);
    }

  public updateWhatsAppTemplate(payload: any): Observable<any> {
    const request = { payload };
    return this.http.post<any>(
      Constant.Site_Url + 'updateWhatsAppTemplate',
      request
    );
  }
}
