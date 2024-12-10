import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getCountAndSum(): Observable<any> {
    // this.loginId = localStorage.getItem('loginId');
    // this.superadminId = localStorage.getItem('superadminId');

    let request: any = {
      payload: {

        roleType: this.loginUser['roleType'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCountAndSum", request);
  }

  getDonationCountAndAmountGroupByCurrency(tabName:string){
    let request: any = {
      payload: {
        requestedFor: tabName,
        // requestedFor: 'YESTERDAY',
        roleType: this.loginUser['roleType'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationCountAndAmountGroupByCurrency",request);
  }

  getDonationCountAndAmountGroupByName(tabName:string){
    let request: any = {
      payload: {
        requestedFor: tabName,
        roleType: this.loginUser['roleType'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationCountAndAmountGroupByNameNew",request);
  }

  getDonationPaymentModeCountAndAmountGroupByName(tabName:string){
    // this.loginId = localStorage.getItem('loginId');
    // this.superadminId = localStorage.getItem('superadminId');
  
    let request: any = {
      payload: {
        requestedFor: tabName,
        roleType: this.loginUser['roleType'],
        token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationPaymentModeCountAndAmountGroupByName",request);
  }
}
