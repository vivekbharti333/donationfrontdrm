import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface AdmitCardFilters {
  academicYear: string; examId: number | null; gradeId: number | null;
  section: string; studentAcademicId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdmitCardService {

  constructor(private http: HttpClient, private cookies: CookieService, private authentication: AuthenticationService) {}
  getAdmitCards(filters: AdmitCardFilters): Observable<any> {
    return this.post('getAdmitCards', {academicYear: filters.academicYear, examId: Number(filters.examId), gradeId: Number(filters.gradeId),
      ...(filters.section ? {section: filters.section} : {}),
      ...(filters.studentAcademicId ? {studentAcademicId: Number(filters.studentAcademicId)} : {})});
  }
  getExamDetails(): Observable<any> { return this.post('getExamDetails', {status: 'ACTIVE'}); }
  getGradeDetails(): Observable<any> { return this.post('getGradeDetails', {}); }
  getStudentAcademicDetails(): Observable<any> { return this.post('getStudentAcademicDetails', {}); }
  getInvoiceHeaderList(): Observable<any> {
    return this.post('getInvoiceHeaderList', {requestFor: 'BYSUPERADMINID',
      token: this.authentication.getLoginUser()?.token || this.cookies.get('token'),
      createdBy: this.authentication.getLoginUser()?.loginId || this.cookies.get('loginId') || this.superadminId});
  }
  private post(endpoint: string, payload: any): Observable<any> {
    const token = this.authentication.getLoginUser()?.token || this.cookies.get('token');
    const options = token ? {headers: new HttpHeaders({Authorization: `Bearer ${token}`})} : {};
    return this.http.post<any>(Constant.Site_Url + endpoint, {payload: {...payload, superadminId: this.superadminId}}, options);
  }
  private get superadminId(): string { return this.authentication.getLoginUser()?.superadminId || this.cookies.get('superadminId'); }
}
