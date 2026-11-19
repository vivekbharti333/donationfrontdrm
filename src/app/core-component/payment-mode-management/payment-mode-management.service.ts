import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentModeManagementService {

  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
   }

   getMasterPaymentModeList(){
    let request: any = {
      payload: {
        roleType: this.loginUser['roleType'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getMasterPaymentModeList", request);
  }

  getPaymentModeListBySuperadminId(superadminId = this.loginUser['superadminId']){
      let request: any = {
        payload: {
          superadminId,
        }
      };
      return this.http.post<any>(Constant.Site_Url + "getPaymentModeListBySuperadminId", request);
    }

    addUpdatePaymentModeBySuperadmin(paymentModeIds :any, superadminId = this.loginUser['superadminId']){
      let request: any = {
        payload: {
          paymentModeIds: paymentModeIds,
          superadminId,
        }
      };
      return this.http.post<any>(Constant.Site_Url + "addOrUpdatePaymentModeBySuperadmin", request);
    }

    changeStatusOfPaymentModeMaster(paymentMode :any){
      let request: any = {
        payload: {
          paymentModeIds: paymentMode,
          superadminId: this.loginUser['superadminId'],
        }
      };
      return this.http.post<any>(Constant.Site_Url + "addPaymentModeBySuperadmin", request);
    }
  
}
