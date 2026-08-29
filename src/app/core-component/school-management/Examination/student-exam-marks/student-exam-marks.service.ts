import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface StudentExamMarksFilters {
  id?: number | null; examScheduleId?: number | null; examId?: number | null;
  examGradeSubjectId?: number | null; academicYear?: string; gradeId?: number | null;
  subjectId?: number | null; studentAcademicId?: number | null; attendanceStatus?: string; status?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentExamMarksService {
  constructor(private http: HttpClient, private cookies: CookieService,
    private authentication: AuthenticationService) {}

  getStudentExamMarks(filters: StudentExamMarksFilters = {}): Observable<any> {
    return this.post('getStudentExamMarks', { superadminId: this.superadminId,
      ...(filters.id ? { id: Number(filters.id) } : {}),
      ...(filters.examScheduleId ? { examScheduleId: Number(filters.examScheduleId) } : {}),
      ...(filters.examId ? { examId: Number(filters.examId) } : {}),
      ...(filters.examGradeSubjectId ? { examGradeSubjectId: Number(filters.examGradeSubjectId) } : {}),
      ...(filters.academicYear?.trim() ? { academicYear: filters.academicYear.trim() } : {}),
      ...(filters.gradeId ? { gradeId: Number(filters.gradeId) } : {}),
      ...(filters.subjectId ? { subjectId: Number(filters.subjectId) } : {}),
      ...(filters.studentAcademicId ? { studentAcademicId: Number(filters.studentAcademicId) } : {}),
      ...(filters.attendanceStatus?.trim() ? { attendanceStatus: filters.attendanceStatus.trim() } : {}),
      ...(filters.status?.trim() ? { status: filters.status.trim() } : {}) });
  }

  addStudentExamMarks(value: any): Observable<any> {
    return this.post('addStudentExamMarks', { ...this.marksPayload(value), evaluatedBy: this.loginId });
  }

  updateStudentExamMarks(value: any): Observable<any> {
    return this.post('updateStudentExamMarks', { id: Number(value?.id), ...this.marksPayload(value), evaluatedBy: this.loginId });
  }

  getExamSchedule(): Observable<any> { return this.post('getExamSchedule', { superadminId: this.superadminId, status: 'ACTIVE' }); }
  getExamDetails(): Observable<any> { return this.post('getExamDetails', { superadminId: this.superadminId, status: 'ACTIVE' }); }
  getExamGradeSubject(): Observable<any> { return this.post('getExamGradeSubject', { superadminId: this.superadminId, status: 'ACTIVE' }); }
  getExamSubject(): Observable<any> { return this.post('getExamSubject', { superadminId: this.superadminId, status: 'ACTIVE' }); }
  getGradeDetails(): Observable<any> { return this.post('getGradeDetails', {}); }
  getStudentAcademicDetails(): Observable<any> { return this.post('getStudentAcademicDetails', { superadminId: this.superadminId }); }

  private marksPayload(value: any): any {
    const attendance = String(value?.attendanceStatus || '').trim().toUpperCase();
    return { examScheduleId: Number(value?.examScheduleId), studentAcademicId: Number(value?.studentAcademicId),
      marksObtained: attendance === 'ABSENT' ? null : Number(value?.marksObtained), attendanceStatus: attendance,
      remarks: String(value?.remarks ?? '').trim(), status: String(value?.status || 'ACTIVE').trim(),
      superadminId: this.superadminId };
  }

  private post(endpoint: string, payload: any): Observable<any> {
    const token = this.authentication.getLoginUser()?.token || this.cookies.get('token');
    const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.post<any>(Constant.Site_Url + endpoint, { payload }, options);
  }
  private get superadminId(): string { return this.authentication.getLoginUser()?.superadminId || this.cookies.get('superadminId'); }
  private get loginId(): string { return this.authentication.getLoginUser()?.loginId || this.cookies.get('loginId') || this.superadminId; }
}
