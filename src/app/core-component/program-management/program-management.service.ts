import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 

@Injectable({
  providedIn: 'root'
})
export class ProgramManagementService {

  constructor(
    private http: HttpClient,
    // private authenticationService: AuthenticationService,
  ) {
    // this.loginUser = this.authenticationService.getLoginUser();
  }

  getDonationTypeList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: "OPTION",
        // roleType: this.loginUser['roleType'],
        // token: this.loginUser['token'],
        // createdBy: this.loginUser['loginId'],
        // superadminId: this.loginUser['superadminId'],
        roleType: 'SUPERADMIN',
        // token: this.loginUser['token'],
        createdBy: '1234567890',
        superadminId: '1234567890',
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getDonationTypeListBySuperadminId", request);
  }
}
