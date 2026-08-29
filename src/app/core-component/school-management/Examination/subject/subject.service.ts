import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';

export interface ExamSubjectFilters {
  status?: string;
  searchText?: string;
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService
  ) {}

  getExamSubject(filters: ExamSubjectFilters = {}): Observable<any> {
    const currentUser = this.authenticationService.getLoginUser();
    const token = currentUser?.token || this.cookieService.get('token');
    const request = {
      payload: {
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId'),
        ...(filters.status?.trim() ? { status: filters.status.trim() } : {}),
        ...(filters.searchText?.trim() ? { searchText: filters.searchText.trim() } : {})
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'getExamSubject', request, options);
  }

  addExamSubject(subject: any): Observable<any> {
    const currentUser = this.authenticationService.getLoginUser();
    const token = currentUser?.token || this.cookieService.get('token');
    const request = {
      payload: {
        subjectCode: String(subject?.subjectCode ?? '').trim(),
        subjectName: String(subject?.subjectName ?? '').trim(),
        description: String(subject?.description ?? '').trim(),
        status: String(subject?.status || 'ACTIVE').trim(),
        createdBy: currentUser?.loginId
          || this.cookieService.get('loginId')
          || this.cookieService.get('superadminId'),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'addExamSubject', request, options);
  }

  updateExamSubject(subject: any): Observable<any> {
    const currentUser = this.authenticationService.getLoginUser();
    const token = currentUser?.token || this.cookieService.get('token');
    const request = {
      payload: {
        id: Number(subject?.id),
        subjectCode: String(subject?.subjectCode ?? '').trim(),
        subjectName: String(subject?.subjectName ?? '').trim(),
        description: String(subject?.description ?? '').trim(),
        status: String(subject?.status || 'ACTIVE').trim(),
        superadminId: currentUser?.superadminId || this.cookieService.get('superadminId')
      }
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
    return this.http.post<any>(Constant.Site_Url + 'updateExamSubject', request, options);
  }
}
