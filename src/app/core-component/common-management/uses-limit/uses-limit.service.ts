import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface UsageLimitConsumption {
  id: number;
  resourceType: string;
  consumptionType: string | null;
  limit: number;
  consume: number;
  status: string | null;
  startDate: string | number | null;
  endDate: string | number | null;
  superadminId: string;
}

export interface UsageLimitResponse {
  responseCode: string | number;
  listPayload?: UsageLimitConsumption[] | null;
}

export interface SaveUsageLimitRequest {
  id?: number;
  resourceType: string;
  consumptionType: string;
  limit: number;
  consume: number;
  status: string;
  startDate: string;
  endDate: string;
  superadminId: string;
}

export interface SaveUsageLimitResponse {
  responseCode: string | number;
  responseMessage?: string;
  payload?: { respCode?: string | number; respMesg?: string };
}

@Injectable({
  providedIn: 'root'
})
export class UsesLimitService {

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService
  ) { }

  addUpdateUsageLimitConsumption(payload: SaveUsageLimitRequest): Observable<SaveUsageLimitResponse> {
    return this.http.post<SaveUsageLimitResponse>(Constant.Site_Url + 'addUpdateUsageLimitConsumption', { payload });
  }

  getUsageLimitConsumptionListBySuperadmin(superadminId: string): Observable<UsageLimitResponse> {
    const loginUser = this.authenticationService.getLoginUser();
    return this.http.post<UsageLimitResponse>(Constant.Site_Url + 'getUsageLimitConsumptionListBySuperadmin', {
      payload: {
        superadminId,
        token: loginUser?.token || this.cookieService.get('token'),
        createdBy: loginUser?.loginId || this.cookieService.get('loginId')
      }
    });
  }
}
