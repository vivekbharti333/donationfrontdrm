import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayManagementService {
 public loginId: any;
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  sendcashfreePaymentResponse(linkId: any, linkStatus: any, amountPaid: any): Observable<any> {
      let request: any = {
        payload: {
          // token: this.loginUser['token'],
          superadminId: this.loginUser['superadminId'],
        }
      };
      return this.http.post<any>(Constant.Site_Url + "updatePgPaymentStatusByCashfree", request);
    }
}
