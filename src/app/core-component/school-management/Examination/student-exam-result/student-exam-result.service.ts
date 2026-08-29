import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

@Injectable({ providedIn: 'root' })
export class StudentExamResultService {
  constructor(private http: HttpClient, private cookies: CookieService,
    private authentication: AuthenticationService) {}
  getStudentExamResult(filters: any = {}): Observable<any> {
    return this.post('getStudentExamResult', { superadminId: this.superadminId,
      ...(filters.examId ? { examId: Number(filters.examId) } : {}),
      ...(filters.studentAcademicId ? { studentAcademicId: Number(filters.studentAcademicId) } : {}),
      ...(filters.published !== '' && filters.published !== null && filters.published !== undefined
        ? { published: Boolean(filters.published) } : {}) });
  }
  generateStudentExamResult(examId:number,studentAcademicId:number):Observable<any>{return this.post('generateStudentExamResult',{examId:Number(examId),studentAcademicId:Number(studentAcademicId),createdBy:this.loginId,superadminId:this.superadminId});}
  generateExamResults(examId:number):Observable<any>{return this.post('generateExamResults',{examId:Number(examId),createdBy:this.loginId,superadminId:this.superadminId});}
  publishExamResult(examId:number,studentAcademicId:number,published:boolean):Observable<any>{return this.post('publishExamResult',{examId:Number(examId),studentAcademicId:Number(studentAcademicId),published,superadminId:this.superadminId});}
  getExamDetails():Observable<any>{return this.post('getExamDetails',{superadminId:this.superadminId});}
  getStudentAcademicDetails():Observable<any>{return this.post('getStudentAcademicDetails',{superadminId:this.superadminId});}
  private post(endpoint:string,payload:any):Observable<any>{const token=this.authentication.getLoginUser()?.token||this.cookies.get('token');const options=token?{headers:new HttpHeaders({Authorization:`Bearer ${token}`})}:{};return this.http.post<any>(Constant.Site_Url+endpoint,{payload},options);}
  private get superadminId():string{return this.authentication.getLoginUser()?.superadminId||this.cookies.get('superadminId');}
  private get loginId():string{return this.authentication.getLoginUser()?.loginId||this.cookies.get('loginId')||this.superadminId;}
}
