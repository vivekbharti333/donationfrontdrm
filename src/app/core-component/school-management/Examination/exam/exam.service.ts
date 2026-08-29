import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface ExamFilters {
  id?: number | null;
  academicYear?: string;
  examCode?: string;
  examName?: string;
  examType?: string;
  status?: string;
  searchText?: string;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService
  ) {}

  getExamDetails(filters: ExamFilters = {}): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'getExamDetails', {
      payload: {
        superadminId: this.superadminId(),
        ...(filters.id ? { id: Number(filters.id) } : {}),
        ...(filters.academicYear?.trim() ? { academicYear: filters.academicYear.trim() } : {}),
        ...(filters.examCode?.trim() ? { examCode: filters.examCode.trim() } : {}),
        ...(filters.examName?.trim() ? { examName: filters.examName.trim() } : {}),
        ...(filters.examType?.trim() ? { examType: filters.examType.trim() } : {}),
        ...(filters.status?.trim() ? { status: filters.status.trim() } : {}),
        ...(filters.searchText?.trim() ? { searchText: filters.searchText.trim() } : {})
      }
    }, this.options());
  }

  addExamDetails(exam: any): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'addExamDetails', {
      payload: this.examPayload(exam, false)
    }, this.options());
  }

  updateExamDetails(exam: any): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'updateExamDetails', {
      payload: this.examPayload(exam, true)
    }, this.options());
  }

  private examPayload(exam: any, includeId: boolean): any {
    const currentUser = this.authenticationService.getLoginUser();
    return {
      ...(includeId ? { id: Number(exam?.id) } : {}),
      examCode: String(exam?.examCode ?? '').trim(),
      examName: String(exam?.examName ?? '').trim(),
      examType: String(exam?.examType ?? '').trim(),
      academicYear: String(exam?.academicYear ?? '').trim(),
      startDate: exam?.startDate,
      endDate: exam?.endDate,
      description: String(exam?.description ?? '').trim(),
      status: String(exam?.status || 'ACTIVE').trim(),
      ...(!includeId ? {
        createdBy: currentUser?.loginId
          || this.cookieService.get('loginId')
          || this.cookieService.get('superadminId')
      } : {}),
      superadminId: this.superadminId()
    };
  }

  private superadminId(): string {
    const currentUser = this.authenticationService.getLoginUser();
    return currentUser?.superadminId || this.cookieService.get('superadminId');
  }

  private options(): { headers: HttpHeaders } | {} {
    const currentUser = this.authenticationService.getLoginUser();
    const token = currentUser?.token || this.cookieService.get('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }
}
