import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CustomerDetailsService {

  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }


  getCustomerDetails(): Observable<any> {
    const request: any = {
      payload: {
        requestFor: 'BY_SUPERADMIN',
        superadminId: this.loginUser['superadminId'],
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getCustomerDetails', request);
  }

  getCompanies(): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'getInvoiceHeaderList', {
      payload: { requestFor: 'BYSUPERADMINID', superadminId: this.loginUser['superadminId'] }
    });
  }

  addCustomerDetails(customer: any): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'addCustomerDetails', {
      payload: {
        ...customer,
        companyId: Number(customer.companyId),
        superadminId: this.loginUser['superadminId'],
        createdBy: this.loginUser['loginId'] || this.cookieService.get('loginId')
      }
    });
  }


}
