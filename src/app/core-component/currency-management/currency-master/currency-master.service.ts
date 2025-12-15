import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';


@Injectable({
  providedIn: 'root'
})
export class CurrencyMasterService {

  public loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }


  getCurrencyMasterList() {
    let request: any = {
      payload: {
        // roleType: this.loginUser['roleType']
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCurrencyMaster", request);
  }


  addCurrencyMaster(currency: any): Observable<any> {
    const request = {
      payload: {
        country: currency.country,
        currencyName: currency.currencyName,
        currencyCode: currency.currencyCode,
        unicode: currency.unicode,
        hexCode: currency.hexCode,
        htmlCode: currency.htmlCode,
        cssCode: currency.cssCode,
      }
    };
    return this.http.post<any>(Constant.Site_Url + 'addCurrencyMaster', request);
  }

  updateCurrencyMasterForm(currency: any): Observable<any> {
    const request = {
      payload: {
        id: currency.id,
        country: currency.country,
        currencyName: currency.currencyName,
        currencyCode: currency.currencyCode,
        unicode: currency.unicode,
        hexCode: currency.hexCode,
        htmlCode: currency.htmlCode,
        cssCode: currency.cssCode,
      }
    };
    return this.http.post<any>(Constant.Site_Url + 'updateCurrencyMaster', request);
  }


}
