import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { InvoiceRequest, InvoiceDetails } from '../../interface/receipt-management'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiptHeaderListService {

  public loginId: any;
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getInvoiceHeaderList(){
    let request: InvoiceRequest = {
      payload: {
        requestFor: 'BYSUPERADMINID',
        // token: this.loginUser['token'],
        createdBy: this.loginUser['loginId'],
        superadminId: this.loginUser['superadminId'],
        // createdBy: '1234567890',
        // superadminId: '1234567890',
      }
    };
    return this.http.post<InvoiceRequest>(Constant.Site_Url + "getInvoiceHeaderList", request);
  }
}
