import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface SchoolDashboardFilters {
  academicYear?: string;
  fromDate?: string;
  toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class SchoolDashboardService {
  constructor(
    private http: HttpClient,
    private authentication: AuthenticationService,
    private cookies: CookieService,
  ) {}

  getSchoolDashboardDetails(filters: SchoolDashboardFilters = {}): Observable<any> {
    return this.post('getSchoolDashboardDetails', {
      superadminId: this.superadminId,
      ...(filters.academicYear ? { academicYear: filters.academicYear } : {}),
      ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
      ...(filters.toDate ? { toDate: filters.toDate } : {}),
    });
  }

  private post(endpoint: string, payload: Record<string, unknown>): Observable<any> {
    const token = this.authentication.getLoginUser()?.token || this.cookies.get('token');
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};

    return this.http.post<any>(Constant.Site_Url + endpoint, { payload }, options);
  }

  private get superadminId(): string {
    return this.authentication.getLoginUser()?.superadminId
      || this.cookies.get('superadminId');
  }
}
