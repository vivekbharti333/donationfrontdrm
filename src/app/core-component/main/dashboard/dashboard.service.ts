import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getLeadCountByStatus(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'TODAY',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getLeadCountByStatus", request);
  }

  getCountAndSum(): Observable<any> {
    let request: any = {
      payload: {
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCountAndSum", request);
  }

  getDonationCountAndAmountGroupByCurrency(tabName:string){
    let request: any = {
      payload: {
        requestedFor: tabName,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationCountAndAmountGroupByCurrency",request);
  }

  getDonationCountAndAmountGroupByName(tabName:string){
    let request: any = {
      payload: {
        requestedFor: tabName,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationCountAndAmountGroupByName",request);
  }

  getDonationCountAndAmountGroupByDate(tabName:string){
    let request: any = {
      payload: {
        requestedFor: tabName,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationCountAndAmountGroupByDate",request);
  }

  getDonationCountAndAmountGroupByNameCustom(firstDate:any, lastDate:any){
    let request: any = {
      payload: {
        requestedFor: 'CUSTOM',
        firstDate: firstDate,
        lastDate: lastDate,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationCountAndAmountGroupByName",request);
  }

  getDonationPaymentModeCountAndAmountGroupByName(tabName:string){
    let request: any = {
      payload: {
        requestedFor: tabName,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getDonationPaymentModeCountAndAmountGroupByName",request);
  }

getDonationPaymentModeCountAndAmountGroupByNameCustom(loginId: any, firstDate: any, lastDate: any) {

  let createdBy: any = '';

  if (this.cookieService.get('roleType') === Constant.fundraisingOfficer) {
    createdBy = this.cookieService.get('loginId');
  } else {
    createdBy = loginId;
  }
  const request = {
    payload: {
      // requestedFor: 'INDIVIDUAL',
      requestedFor: 'CUSTOM',
      firstDate: firstDate,
      lastDate: lastDate,
      createdBy: createdBy,
      roleType: Constant.fundraisingOfficer,
      // roleType: this.cookieService.get('roleType'),
      token: this.cookieService.get('token'),
      superadminId: this.cookieService.get('superadminId')
    }
  };
  return this.http.post<any>(Constant.Site_Url + 'getDonationPaymentModeCountAndAmountGroupByName', request);
}


}
