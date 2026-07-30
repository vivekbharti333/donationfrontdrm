import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';

@Injectable({
  providedIn: 'root'
})
export class AddWhatsAppTemplatesService {

   constructor(private http: HttpClient) {}

  createTemplate(payload: any, file: File | null, mediaType: string): Observable<any> {
    if (!file || mediaType === 'None') {
      return this.submitTemplate(payload);
    }

    return this.uploadTemplateMedia(file, mediaType).pipe(
      switchMap((response: any) => {
        if (response?.responseCode != null && Number(response.responseCode) !== 200) {
          throw response;
        }

        const mediaHandle =
          response?.mediaHandle ||
          response?.mediaId ||
          response?.listPayload?.mediaHandle ||
          response?.listPayload?.mediaId;

        if (!mediaHandle) {
          throw new Error('The media upload did not return a media handle.');
        }

        payload.payload.headerExample = [mediaHandle];
        return this.submitTemplate(payload);
      })
    );
  }

  private uploadTemplateMedia(file: File, mediaType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('mediaType', mediaType.toUpperCase());
    return this.http.post<any>(
      Constant.Site_Url + 'uploadWhatsAppTemplateMedia',
      formData
    );
  }

  private submitTemplate(payload: any): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'addTemplates', payload);
  }
}

