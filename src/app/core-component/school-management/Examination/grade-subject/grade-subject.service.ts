import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface ExamGradeSubjectFilters {
  academicYear?: string;
  gradeId?: number | null;
  subjectId?: number | null;
  subjectType?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class GradeSubjectService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService
  ) {}

  getExamGradeSubject(filters: ExamGradeSubjectFilters = {}): Observable<any> {
    return this.post('getExamGradeSubject', {
      superadminId: this.superadminId,
      ...(filters.academicYear?.trim() ? { academicYear: filters.academicYear.trim() } : {}),
      ...(filters.gradeId ? { gradeId: Number(filters.gradeId) } : {}),
      ...(filters.subjectId ? { subjectId: Number(filters.subjectId) } : {}),
      ...(filters.subjectType?.trim() ? { subjectType: filters.subjectType.trim() } : {}),
      ...(filters.status?.trim() ? { status: filters.status.trim() } : {})
    });
  }

  getExamSubject(): Observable<any> {
    return this.post('getExamSubject', { superadminId: this.superadminId, status: 'ACTIVE' });
  }

  getGradeDetails(): Observable<any> {
    return this.post('getGradeDetails', {});
  }

  addExamGradeSubject(mapping: any): Observable<any> {
    const currentUser = this.authenticationService.getLoginUser();
    return this.post('addExamGradeSubject', {
      academicYear: String(mapping?.academicYear ?? '').trim(),
      gradeId: Number(mapping?.gradeId),
      subjectId: Number(mapping?.subjectId),
      subjectType: String(mapping?.subjectType || 'CORE').trim(),
      status: String(mapping?.status || 'ACTIVE').trim(),
      createdBy: currentUser?.loginId
        || this.cookieService.get('loginId')
        || this.cookieService.get('superadminId'),
      superadminId: this.superadminId
    });
  }

  updateExamGradeSubject(mapping: any): Observable<any> {
    return this.post('updateExamGradeSubject', {
      id: Number(mapping?.id),
      academicYear: String(mapping?.academicYear ?? '').trim(),
      gradeId: Number(mapping?.gradeId),
      subjectId: Number(mapping?.subjectId),
      subjectType: String(mapping?.subjectType || 'CORE').trim(),
      status: String(mapping?.status || 'ACTIVE').trim(),
      superadminId: this.superadminId
    });
  }

  private post(endpoint: string, payload: any): Observable<any> {
    const token = this.authenticationService.getLoginUser()?.token || this.cookieService.get('token');
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + endpoint, { payload }, options);
  }

  private get superadminId(): string {
    return this.authenticationService.getLoginUser()?.superadminId
      || this.cookieService.get('superadminId');
  }
}
