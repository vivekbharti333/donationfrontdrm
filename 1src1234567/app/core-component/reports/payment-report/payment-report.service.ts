import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class PaymentReportService {

  public loginUser: any;
  public details = false;

   constructor(
      private http: HttpClient,
      private authenticationService: AuthenticationService,
      private cookieService: CookieService,
    ) {
      this.loginUser = this.authenticationService.getLoginUser();
    }


    getDonationPaymentModeCountAndAmountGroupByPaymentMode(createdBy: any ,firstDate: any,lastDate: any){
      let request: any = {
        payload: {
          // firstDate: "2025-03-01",
          // lastDate: "2025-03-20",
          // createdBy: '8791548720',
          firstDate: firstDate,
          lastDate: lastDate,
          createdBy: createdBy,
          roleType: this.loginUser['roleType'],
          loginId: this.loginUser['loginId'],
          token: this.loginUser['token'],
          superadminId: this.loginUser['superadminId'],
        }
      };
      return  this.http.post<any>(Constant.Site_Url+"getDonationPaymentModeCountAndAmountGroupByPaymentMode",request);
    }
}
