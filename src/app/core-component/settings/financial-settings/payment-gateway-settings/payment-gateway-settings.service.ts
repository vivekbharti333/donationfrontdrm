import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewaySettingsService {
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  addUpdatePaymentGatewayDetails(pgDetails: any): Observable<any> {
    this.loginUser = this.authenticationService.getLoginUser();
    let request: any = {
      payload: {
        pgProvider: pgDetails['pgProvider'],
        redirectUrl: pgDetails['redirectUrl'],
        url: pgDetails['url'],
        merchantId: pgDetails['merchantId'],
        saltIndex: pgDetails['saltIndex'],
        saltKey: pgDetails['saltKey'],
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addUpdatePaymentGatewayDetails", request);
  }

  getPaymentGatewayDetailsList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: "SUPERADMIN",
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getPaymentGatewayDetailsList", request);
  }

  changePaymentGatewayStatus(requiredStatus: any, pgDetails: any): Observable<any> {
    this.loginUser = this.authenticationService.getLoginUser();
    let request: any = {
      payload: {
        pgProvider: pgDetails['pgProvider'],
        status: requiredStatus,
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "changePaymentGatewayStatus", request);
  }
}
