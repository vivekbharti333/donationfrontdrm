import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';

export interface StudentAttendanceFilters {
  studentAcademicId?: number;
  studentId?: number;
  sessionName?: string;
  grade?: string;
  gradeSection?: string;
  status?: string;
  attendanceDate?: string;
  attendanceStartDate?: string;
  attendanceEndDate?: string;
}

export interface MarkStudentAttendanceRequest {
  studentAcademicId: number;
  attendanceDate: string;
  status: string;
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
  ) { }

  getStudentAttendance(filters: StudentAttendanceFilters = {}): Observable<any> {
    const currentUser = this.authenticationService.getLoginUser();
    const token = currentUser?.token || this.cookieService.get('token');
    const payload = {
      superadminId: currentUser?.superadminId || this.cookieService.get('superadminId'),
      studentAcademicId: filters.studentAcademicId || undefined,
      studentId: filters.studentId || undefined,
      sessionName: filters.sessionName?.trim() || undefined,
      grade: filters.grade?.trim() || undefined,
      gradeSection: filters.gradeSection?.trim() || undefined,
      status: filters.status || undefined,
      attendanceDate: filters.attendanceDate || undefined,
      attendanceStartDate: filters.attendanceStartDate || undefined,
      attendanceEndDate: filters.attendanceEndDate || undefined,
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};

    return this.http.post<any>(Constant.Site_Url + 'getStudentAttendance', { payload }, options);
  }

  markStudentAttendance(attendance: MarkStudentAttendanceRequest): Observable<any> {
    const currentUser = this.authenticationService.getLoginUser();
    const token = currentUser?.token || this.cookieService.get('token');
    const loginId = currentUser?.loginId
      || currentUser?.id
      || this.cookieService.get('loginId')
      || this.cookieService.get('userId');
    const payload = {
      studentAcademicId: Number(attendance.studentAcademicId),
      attendanceDate: attendance.attendanceDate,
      status: attendance.status,
      remarks: attendance.remarks?.trim() || undefined,
      createdBy: loginId,
      markedBy: loginId,
      markedByName: currentUser?.name || currentUser?.fullName || this.cookieService.get('superadminName'),
      superadminId: currentUser?.superadminId || this.cookieService.get('superadminId'),
    };
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};

    return this.http.post<any>(Constant.Site_Url + 'markStudentAttendance', { payload }, options);
  }
}
