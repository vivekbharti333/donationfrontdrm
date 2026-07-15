import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CampaignDashboardService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getCampaignReportByGroupCampaignName(tabName:any){
    let request: any = {
      payload: {
        requestedFor: tabName,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getCampaignReportByGroupCampaignName",request);
  }

}
