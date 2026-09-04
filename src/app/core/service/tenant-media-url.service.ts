import { Injectable } from '@angular/core';
import { Constant } from '../constant/constants';

export type TenantMediaType = 'user_pic' | 'student_pic' | 'receipt_pic' | 'crm_image' | 'media';

/** Builds every tenant media URL from one shared convention. */
@Injectable({ providedIn: 'root' })
export class TenantMediaUrlService {
  url(superadminId: string | number | null | undefined, mediaType: TenantMediaType,
    fileName: string | null | undefined): string {
    if (!superadminId || !fileName || this.isDataUrl(fileName)) return fileName || '';
    return `${Constant.Site_Url}media/${encodeURIComponent(String(superadminId))}/`
      + `${encodeURIComponent(mediaType)}/${encodeURIComponent(fileName)}`;
  }

  userPicture(service: string | null | undefined, superadminId: string | number | null | undefined,
    fileName: string | null | undefined): string {
    return this.serviceUrl(service, superadminId, 'user_pic', fileName);
  }
  studentPicture(service: string | null | undefined, superadminId: string | number | null | undefined,
    fileName: string | null | undefined): string {
    return this.serviceUrl(service, superadminId, 'student_pic', fileName);
  }
  receiptPicture(service: string | null | undefined, superadminId: string | number | null | undefined,
    fileName: string | null | undefined): string {
    return this.serviceUrl(service, superadminId, 'receipt_pic', fileName);
  }
  applicationImage(service: string | null | undefined, superadminId: string | number | null | undefined,
    fileName: string | null | undefined): string {
    return this.serviceUrl(service, superadminId, 'crm_image', fileName);
  }
  private serviceUrl(service: string | null | undefined, superadminId: string | number | null | undefined,
    mediaType: TenantMediaType, fileName: string | null | undefined): string {
    if (!service || !superadminId || !fileName || this.isDataUrl(fileName)) return fileName || '';
    const serviceFolder = String(service).split(',')[0].trim().replace(/[^A-Za-z0-9_-]/g, '_');
    return `${Constant.Site_Url}media/${encodeURIComponent(serviceFolder)}/${encodeURIComponent(String(superadminId))}/`
      + `${encodeURIComponent(mediaType)}/${encodeURIComponent(fileName)}`;
  }
  private isDataUrl(value: string): boolean { return value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://'); }
}
