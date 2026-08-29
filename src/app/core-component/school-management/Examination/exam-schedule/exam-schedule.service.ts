import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface ExamScheduleFilters {
  id?: number | null;
  examId?: number | null;
  examGradeSubjectId?: number | null;
  examDate?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class ExamScheduleService {
  constructor(private http: HttpClient, private cookieService: CookieService,
    private authenticationService: AuthenticationService) {}

  getExamSchedule(filters: ExamScheduleFilters = {}): Observable<any> {
    return this.post('getExamSchedule', {
      superadminId: this.superadminId,
      ...(filters.id ? { id: Number(filters.id) } : {}),
      ...(filters.examId ? { examId: Number(filters.examId) } : {}),
      ...(filters.examGradeSubjectId ? { examGradeSubjectId: Number(filters.examGradeSubjectId) } : {}),
      ...(filters.examDate ? { examDate: filters.examDate } : {}),
      ...(filters.status?.trim() ? { status: filters.status.trim() } : {})
    });
  }

  addExamSchedule(schedule: any): Observable<any> {
    const user = this.authenticationService.getLoginUser();
    return this.post('addExamSchedule', {
      ...this.schedulePayload(schedule),
      createdBy: user?.loginId || this.cookieService.get('loginId') || this.cookieService.get('superadminId')
    });
  }

  updateExamSchedule(schedule: any): Observable<any> {
    return this.post('updateExamSchedule', { id: Number(schedule?.id), ...this.schedulePayload(schedule) });
  }

  getExamDetails(): Observable<any> {
    return this.post('getExamDetails', { superadminId: this.superadminId, status: 'ACTIVE' });
  }

  getExamGradeSubject(): Observable<any> {
    return this.post('getExamGradeSubject', { superadminId: this.superadminId, status: 'ACTIVE' });
  }

  getExamSubject(): Observable<any> {
    return this.post('getExamSubject', { superadminId: this.superadminId, status: 'ACTIVE' });
  }

  getGradeDetails(): Observable<any> { return this.post('getGradeDetails', {}); }

  private schedulePayload(schedule: any): any {
    return {
      examId: Number(schedule?.examId),
      examGradeSubjectId: Number(schedule?.examGradeSubjectId),
      examDate: schedule?.examDate,
      startTime: String(schedule?.startTime ?? '').trim(),
      endTime: String(schedule?.endTime ?? '').trim(),
      maximumMarks: Number(schedule?.maximumMarks),
      passingMarks: Number(schedule?.passingMarks),
      roomNumber: String(schedule?.roomNumber ?? '').trim(),
      instructions: String(schedule?.instructions ?? '').trim(),
      status: String(schedule?.status || 'ACTIVE').trim(),
      superadminId: this.superadminId
    };
  }

  private post(endpoint: string, payload: any): Observable<any> {
    const token = this.authenticationService.getLoginUser()?.token || this.cookieService.get('token');
    const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.post<any>(Constant.Site_Url + endpoint, { payload }, options);
  }

  private get superadminId(): string {
    return this.authenticationService.getLoginUser()?.superadminId || this.cookieService.get('superadminId');
  }
}
