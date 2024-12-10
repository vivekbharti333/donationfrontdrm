import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 

@Injectable({
  providedIn: 'root'
})
export class PaymentModeService {

  constructor(
    private http: HttpClient,
    // private authenticationService: AuthenticationService,
  ) {
    // this.loginUser = this.authenticationService.getLoginUser();
  }

  getPaymentModeList(){
    let request: any = {
      payload: {
        // superadminId: this.loginUser['superadminId'],
        superadminId: '1234567890',
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getPaymentModeListBySuperadminId", request);
  }
}