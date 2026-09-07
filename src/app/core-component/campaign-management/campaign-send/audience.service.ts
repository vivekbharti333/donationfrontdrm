import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';

@Injectable({ providedIn: 'root' })
export class AudienceService {
  constructor(private http: HttpClient) {}
  list() { return this.http.post<any>(Constant.Site_Url + 'getAudiences', {}); }
  create(audienceName: string) { return this.http.post<any>(Constant.Site_Url + 'addAudience', { payload: { audienceName } }); }
  contacts(audienceId: number | null) { return this.http.post<any>(Constant.Site_Url + 'getAudienceContacts', { payload: { audienceId } }); }
  attach(audienceId: number, contactIds: number[]) { return this.http.post<any>(Constant.Site_Url + 'addAudienceContacts', { payload: { audienceId, contactIds } }); }
  manual(audienceId: number, contact: any) { return this.http.post<any>(Constant.Site_Url + 'addAudienceContact', { payload: { audienceId, contact } }); }
  upload(file: File, audienceName: string) {
    const form = new FormData(); form.append('file', file); form.append('audienceName', audienceName);
    return this.http.post<any>(Constant.Site_Url + 'uploadAudienceExcel', form);
  }
  logs(campaignId: number) { return this.http.post<any>(Constant.Site_Url + 'getCampaignRecipients', { payload: { campaignId } }); }
}
