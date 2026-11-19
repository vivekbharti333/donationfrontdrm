import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  public loginId: any;
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getCurrencyDetailBySuperadmin(superadminId = this.loginUser['superadminId']): Observable<any> {
    let request: any = {
      payload: {
        // token: this.loginUser['token'],
        superadminId,
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCurrencyDetailsBySuperadmin", request);
  }
  

  addUpdateCurrencyBySuperadmin(ids: string, superadminId = this.loginUser['superadminId']): Observable<any> {
    const request = {
      payload: {
        currencyMasterIds: ids,
        superadminId,
      }
    };
    return this.http.post<any>(Constant.Site_Url + 'addUpdateCurrencyBySuperadmin', request);
  }
}
