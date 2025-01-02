import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 

@Injectable({
  providedIn: 'root'
})
export class PaymentModeManagementService {

  constructor(
    private http: HttpClient,
  ) {
    
   }

   getMasterPaymentModeList(){
    let request: any = {
      payload: {
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getMasterPaymentModeList", request);
  }

  getPaymentModeListBySuperadminId(){
      let request: any = {
        payload: {
          // superadminId: this.loginUser['superadminId'],
          superadminId: '1234567890',
        }
      };
      return this.http.post<any>(Constant.Site_Url + "getPaymentModeListBySuperadminId", request);
    }
  
}
