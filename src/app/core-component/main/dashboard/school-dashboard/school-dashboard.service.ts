import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, timeout } from 'rxjs';
import { SKIP_GLOBAL_SPINNER } from 'src/app/core/interceptor/spinner/spinner-context';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface SchoolDashboardFilters {
  academicYear?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SchoolDashboardSummary {
  totalStudents: number;
  todayPresent: number;
  todayAbsent: number;
  currentMonthFeeCollected: number;
  feeDue: number;
  dashboardDate: string;
  collectionMonth: string;
  timeZone: string;
}

export interface SchoolEnrollment {
  sessionName: string;
  classes: { className: string; studentCount: number }[];
}

export interface SchoolAttendanceOverview {
  attendanceDate: string;
  timeZone: string;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
}

@Injectable({ providedIn: 'root' })
export class SchoolDashboardService {
  constructor(
    private http: HttpClient,
    private authentication: AuthenticationService,
    private cookies: CookieService,
  ) {}

  getSchoolDashboard(): Observable<{ responseCode: number; responseMessage: string; payload?: SchoolDashboardSummary }> {
    return this.post('getSchoolDashboard', { superadminId: this.superadminId });
  }

  getSchoolAttendanceOverview(): Observable<{ responseCode: number; responseMessage: string; payload?: SchoolAttendanceOverview }> {
    return this.post('getSchoolAttendanceOverview', { superadminId: this.superadminId });
  }

  getSchoolStudentEnrollment(sessionName: string): Observable<{ responseCode: number; responseMessage: string; payload?: SchoolEnrollment }> {
    return this.post('getSchoolStudentEnrollment', { superadminId: this.superadminId, sessionName });
  }

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
    const options = {
      context: new HttpContext().set(SKIP_GLOBAL_SPINNER, true),
      ...(token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {}),
    };

    return this.http.post<any>(Constant.Site_Url + endpoint, { payload }, options)
      .pipe(timeout(15000));
  }

  private get superadminId(): string {
    return this.authentication.getLoginUser()?.superadminId
      || this.cookies.get('superadminId');
  }
}
