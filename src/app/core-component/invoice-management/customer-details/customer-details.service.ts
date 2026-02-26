import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { InvoiceRequest, InvoiceDetails } from '../../interface/receipt-management'; 
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CustomerDetailsService {

  public loginUser: any;
  public details = false;

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
        superadminId: '8800689752',
        // superadminId: this.loginUser['superadminId'],
      },
    };
    return this.http.post<any>(Constant.Site_Url + 'getCustomerDetails', request);
  }


}




  