import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface GradingScaleFilters { id?:number|null; academicYear?:string; gradeName?:string; resultStatus?:string; status?:string; }

@Injectable({ providedIn:'root' })
export class GradingScaleService {
  constructor(private http:HttpClient,private cookies:CookieService,private authentication:AuthenticationService){}

  getGradingScale(filters:GradingScaleFilters={}):Observable<any>{return this.post('getGradingScale',{superadminId:this.superadminId,
    ...(filters.id?{id:Number(filters.id)}:{}),...(filters.academicYear?.trim()?{academicYear:filters.academicYear.trim()}:{}),
    ...(filters.gradeName?.trim()?{gradeName:filters.gradeName.trim()}:{}),...(filters.resultStatus?.trim()?{resultStatus:filters.resultStatus.trim()}:{}),
    ...(filters.status?.trim()?{status:filters.status.trim()}: {})});}
  addGradingScale(value:any):Observable<any>{return this.post('addGradingScale',{...this.payload(value),createdBy:this.loginId});}
  updateGradingScale(value:any):Observable<any>{return this.post('updateGradingScale',{id:Number(value?.id),...this.payload(value)});}

  private payload(v:any):any{return{academicYear:String(v?.academicYear??'').trim(),gradeName:String(v?.gradeName??'').trim(),
    minimumPercentage:Number(v?.minimumPercentage),maximumPercentage:Number(v?.maximumPercentage),
    gradePoint:v?.gradePoint===null||v?.gradePoint===''?null:Number(v.gradePoint),resultStatus:String(v?.resultStatus||'PASS').trim(),
    description:String(v?.description??'').trim(),status:String(v?.status||'ACTIVE').trim(),superadminId:this.superadminId};}
  private post(endpoint:string,payload:any):Observable<any>{const token=this.authentication.getLoginUser()?.token||this.cookies.get('token');
    const options=token?{headers:new HttpHeaders({Authorization:`Bearer ${token}`})}:{};return this.http.post<any>(Constant.Site_Url+endpoint,{payload},options);}
  private get superadminId():string{return this.authentication.getLoginUser()?.superadminId||this.cookies.get('superadminId');}
  private get loginId():string{return this.authentication.getLoginUser()?.loginId||this.cookies.get('loginId')||this.superadminId;}
}
