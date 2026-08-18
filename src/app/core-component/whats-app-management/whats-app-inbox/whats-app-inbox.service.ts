import { Injectable } from '@angular/core';
import { map, Observable, switchMap, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppInboxService {
 public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

    getWhatsAppMessage(): Observable<any> {
      let request: any = {
        payload: {
  
        }
      };
      return this.http.post<any>(Constant.Site_Url + "getWhatsAppMessage", request);
    }

    replyMessage(payload: any): Observable<any> {
      let request: any = {
        payload: {
          "waId": payload.waId,
          "messageText": payload.messageText,
          "msgBodyText": payload.messageText,
          "messageType": payload.messageType || 'text',
          "mediaId": payload.mediaId || null,
          "mimeType": payload.mimeType || null,
          "fileName": payload.fileName || null,
          "phoneNumberId": payload.phoneNumberId || null
        }
      };
      return this.http.post<any>(Constant.Site_Url + "replyMessage", request);
    }

    sendReply(payload: any, file: File | null): Observable<any> {
      if (!file) {
        return this.replyMessage(payload).pipe(map(response => ({ response, media: null })));
      }

      const formData = new FormData();
      formData.append('file', file, file.name);
      if (payload.phoneNumberId) {
        formData.append('phoneNumberId', payload.phoneNumberId);
      }

      return this.http.post<any>(Constant.Site_Url + 'uploadWhatsAppReplyMedia', formData).pipe(
        switchMap(uploadResponse => {
          if (uploadResponse?.responseCode != null && Number(uploadResponse.responseCode) !== 200) {
            throw new Error(uploadResponse.responseMessage || 'Media upload failed.');
          }
          const media = uploadResponse?.payload || uploadResponse?.listPayload || uploadResponse;
          if (!media?.mediaId) {
            throw new Error('Media upload did not return a media ID.');
          }
          return this.replyMessage({ ...payload, ...media }).pipe(
            map(response => ({ response, media }))
          );
        })
      );
    }

  sendMessage(payload: any): Observable<any> {

  return this.http.post<any>(Constant.Site_Url + 'sendMessage',
    payload
  );
}

  downloadMedia(mediaId: string, mediaType: string, phoneNumberId?: string): Observable<Blob> {
    const normalizedMediaType = (mediaType || 'image').toLowerCase();
    const request = {
      mediaId,
      phoneNumberId: phoneNumberId || null,
      [normalizedMediaType]: { id: mediaId }
    };

    return this.http.post(Constant.Site_Url + 'whatsAppMediaDownload',
      request,
      { responseType: 'blob' }
    ).pipe(timeout(30000));
  }

}
