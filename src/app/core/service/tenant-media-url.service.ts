import { Injectable } from '@angular/core';
import { Constant } from '../constant/constants';

export type TenantMediaType = 'user_pic' | 'student_pic' | 'receipt_pic' | 'media';

/** Builds every tenant media URL from one shared convention. */
@Injectable({ providedIn: 'root' })
export class TenantMediaUrlService {
  url(superadminId: string | number | null | undefined, mediaType: TenantMediaType,
    fileName: string | null | undefined): string {
    if (!superadminId || !fileName || this.isDataUrl(fileName)) return fileName || '';
    return `${Constant.Site_Url}media/${encodeURIComponent(String(superadminId))}/`
      + `${encodeURIComponent(mediaType)}/${encodeURIComponent(fileName)}`;
  }

  userPicture(superadminId: string | number | null | undefined, fileName: string | null | undefined): string {
    return this.url(superadminId, 'user_pic', fileName);
  }
  studentPicture(superadminId: string | number | null | undefined, fileName: string | null | undefined): string {
    return this.url(superadminId, 'student_pic', fileName);
  }
  receiptPicture(superadminId: string | number | null | undefined, fileName: string | null | undefined): string {
    return this.url(superadminId, 'receipt_pic', fileName);
  }
  private isDataUrl(value: string): boolean { return value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://'); }
}
