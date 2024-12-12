import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ProgramManagementService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
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

  // getProgramDetailsList(): Observable<any> {
  //   let request: any = {
  //     payload: {
  //       requestedFor: "ALL",
  //       roleType: this.loginUser['roleType'],
  //       createdBy: this.loginUser['userId'],
  //       token: this.loginUser['token'],
  //       superadminId: this.loginUser['superadminId'],
  //     }
  //   };
  //   return this.http.post<any>(Constant.Site_Url + "getDonationTypeListBySuperadminId", request);
  // }
}
