import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';
import { TenantMediaUrlService } from 'src/app/core/service/tenant-media-url.service';

export interface DueSchoolHeader { name: string; logo: string; logoFallbacks?: string[]; }

export interface DueFeeInstallment {
  installmentName: string;
  payableAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

export interface DueFeeRow {
  studentId: number;
  studentAcademicId: number;
  admissionNo: string;
  rollNumber: string;
  studentName: string;
  fatherName?: string;
  sessionName: string;
  grade: string;
  gradeSection: string;
  feeTypeId: number;
  feeTypeName: string;
  frequency: string;
  dueThroughMonth: string;
  dueInstallments: DueFeeInstallment[];
  totalDue: number | null;
  requiresReview: boolean;
  reviewMessage?: string;
}

export interface DueFeeFilters {
  sessionName: string;
  grade?: string;
  gradeSection?: string;
  studentId?: number;
  feeTypeIds?: number[];
  dueThroughMonth?: string;
  includePreviousSessions?: boolean;
}

export interface DueFeeReportResponse {
  responseCode: number;
  responseMessage?: string;
  listPayload?: DueFeeRow[];
}

@Injectable({
  providedIn: 'root'
})
export class FeeDueReportService {

  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private authentication: AuthenticationService,
    private media: TenantMediaUrlService
  ) {}

  getSchoolHeader(): Observable<DueSchoolHeader> {
    const user = this.authentication.getLoginUser();
    const token = user?.token || this.cookies.get('token');
    const tenant = user?.superadminId || this.cookies.get('superadminId');
    const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.post<any>(Constant.Site_Url + 'getInvoiceHeaderList', {
      payload: { requestFor: 'BYSUPERADMINID', superadminId: tenant, token }
    }, options).pipe(map(response => {
      const header = (response?.listPayload ?? response?.payload)?.[0];
      const name = [header?.companyFirstName, header?.companyLastName].filter(Boolean).join(' ').trim();
      if (Number(response?.responseCode) !== Constant.SUCCESS_CODE || !name)
        throw new Error('Unable to load the school name for printing. Check the school receipt header and reload the page.');
      let logo = String(header.companyLogo || '').trim();
      let logoFallbacks: string[] = [];
      if (logo && !/^(data:image\/|blob:|https?:)/i.test(logo)) {
        const schoolService = user?.service || this.cookies.get('service');
        const schoolTenant = header.superadminId || tenant;
        if (logo.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(logo)) logo = `data:image/png;base64,${logo}`;
        else {
          const fileName = logo;
          const tenantPath = encodeURIComponent(String(schoolTenant));
          const servicePath = String(schoolService || '').split(',')[0].trim().replace(/[^A-Za-z0-9_-]/g, '_');
          logo = schoolService ? this.media.receiptPicture(schoolService, schoolTenant, fileName)
            : this.media.url(schoolTenant, 'receipt_pic', fileName);
          logoFallbacks = [...new Set([
            ...(servicePath ? [`${Constant.Site_Url}invoiceHeaderImage/${encodeURIComponent(servicePath)}/${tenantPath}/${encodeURIComponent(fileName)}`] : []),
            this.media.url(schoolTenant, 'receipt_pic', fileName),
            `${Constant.Site_Url}invoiceHeaderImage/${tenantPath}/${encodeURIComponent(fileName)}`
          ])].filter(url => url !== logo);
        }
      }
      return { name, logo, logoFallbacks };
    }));
  }

  getReport(filters: DueFeeFilters): Observable<DueFeeReportResponse> {
    const user = this.authentication.getLoginUser();
    const token = user?.token || this.cookies.get('token');
    const payload = {
      ...filters,
      superadminId: user?.superadminId || this.cookies.get('superadminId')
    };
    const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.post<DueFeeReportResponse>(Constant.Site_Url + 'getStudentDueFeeReport', { payload }, options);
  }
}
