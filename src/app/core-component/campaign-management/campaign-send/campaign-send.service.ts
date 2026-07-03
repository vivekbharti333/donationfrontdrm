import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignSendService {

  public loginUser;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getCampaignDetails(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        // roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        superadminId: '1234567890',
        // superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCampaignDetails", request);
  }

  sendCompaign(campaignDetails: any): Observable<any> {
    let request: any = {
      payload: {
        campaignId: campaignDetails.campaignId,
        campaignChannel: campaignDetails.campaignChannel,

        token: this.cookieService.get('token'),
        createdBy: '',
        superadminId: '1234567890',

      }
    };
    return this.http.post<any>(Constant.Site_Url + "sendCampaign", request);
  }
}
