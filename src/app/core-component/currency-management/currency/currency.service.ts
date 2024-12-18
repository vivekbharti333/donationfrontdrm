import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  public loginId: any;
  public superadminId: any;
  public loginUser: any;

  constructor(
    private http: HttpClient,
    // private authenticationService: AuthenticationService,
  ) {
    // this.loginUser = this.authenticationService.getLoginUser();
  }

  getCurrencyDetailBySuperadmin(): Observable<any> {
    let request: any = {
      payload: {
        // token: this.loginUser['token'],
        superadminId: '1234567890',
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCurrencyDetailsBySuperadmin", request);
  }
}
