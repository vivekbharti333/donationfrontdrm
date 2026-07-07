import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ContactDetailsService {
public loginUser;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getContactDetails(): Observable<any> {
    let request: any = {
      payload: {
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getContactDetails", request);
  }

  saveContactDetails(contactDetails: any): Observable<any> {
    let request: any = {
      payload: {
        contactName: contactDetails.contactName,
        mobileNumber: contactDetails.mobileNumber,
        alternateNumber: contactDetails.alternateNumber,
        emailId: contactDetails.emailId,
        companyName: contactDetails.companyName,
        address: contactDetails.address,
        city: contactDetails.city,
        leadSource: contactDetails.leadSource,
        assignedTo: contactDetails.assignedTo,

        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addContactDetails", request);
  }

  changeContactStatus(rawdata: any): Observable<any> {
    let request: any = {
      payload: {
        id: rawdata.id,
      }
    };
    return this.http.post<any>(Constant.Site_Url + "changeContactStatus", request);
  }
}
