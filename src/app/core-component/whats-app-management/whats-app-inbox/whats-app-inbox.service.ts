import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppInboxService {
 public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

    getWhatsAppMessage(): Observable<any> {
      let request: any = {
        payload: {
  
        }
      };
      return this.http.post<any>(Constant.Site_Url + "getWhatsAppMessage", request);
    }

    replyMessage(payload: any): Observable<any> {
      let request: any = {
        payload: {
          "waId": payload.waId,
          "messageText": payload.messageText,
          "msgBodyText": payload.messageText
        }
      };
      return this.http.post<any>(Constant.Site_Url + "replyMessage", request);
    }

  sendMessage(payload: any): Observable<any> {

  return this.http.post<any>(Constant.Site_Url + 'sendMessage',
    payload
  );
}

}
