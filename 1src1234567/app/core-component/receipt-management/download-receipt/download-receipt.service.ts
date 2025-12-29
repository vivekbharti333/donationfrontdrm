import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { DonationDetailsRequest } from '../../interface/donation-management';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class DownloadReceiptService {

  constructor(
    private http: HttpClient,
     private cookieService: CookieService
    // private authenticationService: AuthenticationService,
  ) {
    // this.loginUser = this.authenticationService.getLoginUser();
  }

  getDonationListByReceiptNumber(receiptNum: any): Observable<any> {
    let request: DonationDetailsRequest = {
      payload: {
        receiptNumber: receiptNum,
        createdBy: this.cookieService.get('loginId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<DonationDetailsRequest>(Constant.Site_Url + "getDonationListByReceiptNumber", request);
  }

  downloadPdf(reffNo: string): Observable<HttpResponse<Blob>> {
    const url = Constant.Site_Url+"donationinvoice/"+reffNo;
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
