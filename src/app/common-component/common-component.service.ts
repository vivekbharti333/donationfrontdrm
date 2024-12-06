import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CommonComponentService {

  public loginUser: any;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) { }

  getApplicaionHeaderDetails(): Observable<any> {
    let request: any = {
      payload: {
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getApplicationHeaderDetailsBySuperadminId", request);
  }

}
