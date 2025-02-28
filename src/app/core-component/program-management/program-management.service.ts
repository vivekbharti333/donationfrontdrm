import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ProgramManagementService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getDonationTypeList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: "OPTION",
        roleType: this.cookieService.get('roleType'),
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getDonationTypeListBySuperadminId", request);
  }

  getDonationTypeAmount(programId: any, currencyCode: any): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: "OPTION",
        programId: programId,
        currencyCode: currencyCode,
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getDonationTypeAmountListBySuperadminId", request);
  }

  getProgramDetailsList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: "ALL",
        roleType: this.cookieService.get('roleType'),
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    // return this.http.post<any>(Constant.Site_Url + "getDonationTypeListBySuperadminId", request);
    return this.http.post<any>(Constant.Site_Url + "getDonationTypeAndAmtListBySuperadminId", request);
  }

  addProgramDetails(programDetails: any): Observable<any> {
    this.loginUser = this.authenticationService.getLoginUser();
    let request: any = {
      payload: {
       
        programName: programDetails.programName,
        programAmount: programDetails.programAmount,
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addDonationType", request);
  }

  addProgramDetailsAmount(programDetailsAmt: any): Observable<any> {
    this.loginUser = this.authenticationService.getLoginUser();
    let request: any = {
      payload: {
       
        programId: programDetailsAmt.programId,
        programAmount: programDetailsAmt.programAmount,
        currencyCode: programDetailsAmt.currencyCode,
        createdBy: this.loginUser['userId'],
        token: this.loginUser['token'],
        superadminId: this.loginUser['superadminId'],
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addDonationTypeAmount", request);
  }

  changeProgramStatus(programDetails: any): Observable<any> {
    let request: any = {
      payload: {
        id: programDetails['id'],
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeDonationTypeStatus",request);
  }

  updateProgramDetails(programDetails: any): Observable<any> {
    console.log(programDetails.id+" iddd")
    this.loginUser = this.authenticationService.getLoginUser();
    let request: any = {
      payload: {
        id: programDetails.id,
        programName: programDetails.programName,
        programAmount: programDetails.programAmount,
        createdBy: this.cookieService.get('userId'),
        token: this.cookieService.get('token'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "updateDonationType", request);
  }
}
