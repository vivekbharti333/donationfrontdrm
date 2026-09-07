import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { AddWhatsAppTemplatesService } from '../add-whats-app-templates/add-whats-app-templates.service';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppTemplatesService {

 public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private templateMediaService: AddWhatsAppTemplatesService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getWhatsAppTemplate(): Observable<any> {
      let request: any = {
        payload: {
          "requestFor": "ALL",
          // createdBy: this.loginUser['loginId'],
          // roleType: this.loginUser['roleType'],
          // loginId: this.loginUser['loginId'],
          // token: this.loginUser['token'],
          superadminId: this.loginUser['superadminId'],
  
        }
      };
      return this.http.post<any>(Constant.Site_Url + "getWhatsAppTemplate", request);
    }

    deleteWhatsAppTemplateByName(templateName: string, templateId?: string | number): Observable<any> {
      let request: any = {
        payload: {
          "templateName": templateName,  
          "superadminId": this.loginUser?.superadminId,
          "templateId": templateId,
        }
      };
      return this.http.post<any>(Constant.Site_Url + "deleteWhatsAppTemplateByName", request);
    }

  public updateWhatsAppTemplate(payload: any, file: File | null = null): Observable<any> {
    if (file) {
      return this.templateMediaService.uploadTemplateMedia(file, payload.headerFormat).pipe(
        switchMap(response => {
          const handle = response?.payload?.mediaHandle || response?.mediaHandle || response?.mapPayload?.mediaHandle;
          if (Number(response?.responseCode) !== 200 || !handle) {
            throw new Error(response?.responseMessage || 'The media upload did not return a media handle.');
          }
          return this.updateWhatsAppTemplate({ ...payload, headerExample: [handle] });
        })
      );
    }
    const request = { payload };
    return this.http.post<any>(
      Constant.Site_Url + 'updateWhatsAppTemplate',
      request
    );
  }

  getTemplateForEdit(templateId: string | number): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'getWhatsAppTemplate', {
      payload: {
        requestFor: 'BY_ID',
        templateId: String(templateId),
        superadminId: this.loginUser?.superadminId
      }
    });
  }
}
