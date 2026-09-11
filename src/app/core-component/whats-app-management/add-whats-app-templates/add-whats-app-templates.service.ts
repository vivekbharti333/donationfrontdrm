import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { SKIP_GLOBAL_SPINNER } from 'src/app/core/interceptor/spinner/spinner-context';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AddWhatsAppTemplatesService {

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService
  ) {}

  createTemplate(payload: any, file: File | null, mediaType: string): Observable<any> {
    const superadminId = this.getSuperadminId();
    payload.payload = { ...(payload.payload || {}), superadminId };

    if (!file || mediaType === 'None') {
      return this.submitTemplate(payload);
    }

    return this.uploadTemplateMedia(file, mediaType, superadminId, true).pipe(
      switchMap((response: any) => {
        if (response?.responseCode != null && Number(response.responseCode) !== 200) {
          throw response;
        }

        const mediaHandle =
          response?.mediaHandle ||
          response?.mediaId ||
          response?.payload?.mediaHandle ||
          response?.payload?.mediaId ||
          response?.mapPayload?.mediaHandle ||
          response?.listPayload?.mediaHandle ||
          response?.listPayload?.mediaId;

        if (!mediaHandle) {
          throw new Error('The media upload did not return a media handle.');
        }

        if (mediaType.toUpperCase() === 'IMAGE') {
          const imageFileName = response?.payload?.headerImageFileName || response?.headerImageFileName
            || response?.mapPayload?.headerImageFileName;
          if (!imageFileName) {
            throw new Error('The image was not saved. Please update the API and upload it again.');
          }
          payload.payload.headerImageFileName = imageFileName;
          payload.payload.headerImageUrl = null;
          payload.payload.headerImageBase64 = null;
        }
        payload.payload.headerExample = [mediaHandle];
        return this.submitTemplate(payload);
      })
    );
  }

  public uploadTemplateMedia(file: File, mediaType: string, superadminId?: string, skipGlobalSpinner = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('mediaType', mediaType.toUpperCase());
    return this.http.post<any>(
      Constant.Site_Url + 'uploadWhatsAppTemplateMedia',
      formData,
      this.authOptions(skipGlobalSpinner)
    );
  }

  private submitTemplate(payload: any): Observable<any> {
    return this.http.post<any>(Constant.Site_Url + 'addTemplates', payload, this.authOptions(true));
  }

  private getSuperadminId(): string {
    const currentUser = this.authenticationService.getLoginUser();
    return currentUser?.superadminId || this.cookieService.get('superadminId');
  }

  private authOptions(skipGlobalSpinner = false): { headers: HttpHeaders; context: HttpContext } {
    const token = this.cookieService.get('token');
    return {
      context: new HttpContext().set(SKIP_GLOBAL_SPINNER, skipGlobalSpinner),
      headers: token
        ? new HttpHeaders({ Authorization: `Bearer ${token}` })
        : new HttpHeaders()
    };
  }
}
