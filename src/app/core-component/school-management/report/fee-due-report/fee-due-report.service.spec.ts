import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';
import { FeeDueReportService } from './fee-due-report.service';

describe('FeeDueReportService', () => {
  let service: FeeDueReportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthenticationService, useValue: { getLoginUser: () => ({ token: 'test-token', superadminId: 'school-A' }) } },
        { provide: CookieService, useValue: { get: () => '' } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FeeDueReportService);
  });

  afterEach(() => http.verify());
  it('uses the report endpoint, request wrapper and authenticated school credentials', () => {
    service.getReport({ sessionName: '2026-27', dueThroughMonth: 'January', feeTypeIds: [1, 2] }).subscribe();
    const request = http.expectOne(Constant.Site_Url + 'getStudentDueFeeReport');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(request.request.body).toEqual({ payload: { sessionName: '2026-27', dueThroughMonth: 'January', feeTypeIds: [1, 2], superadminId: 'school-A' } });
    request.flush({ responseCode: 200, listPayload: [] });
  });

  it('loads the same school receipt heading and resolves its tenant logo URL', () => {
    let schoolName = ''; let logo = ''; let alternatives: string[] = [];
    service.getSchoolHeader().subscribe(header => { schoolName = header.name; logo = header.logo; alternatives = header.logoFallbacks || []; });
    const request = http.expectOne(Constant.Site_Url + 'getInvoiceHeaderList');
    expect(request.request.body.payload.superadminId).toBe('school-A');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({ responseCode: 200, listPayload: [{ companyFirstName: 'Champaran', companyLastName: 'International Academy',
      companyLogo: 'logo.png', superadminId: 'school-A' }] });
    expect(schoolName).toBe('Champaran International Academy');
    expect(logo).toBe(Constant.Site_Url + 'media/school-A/receipt_pic/logo.png');
    expect(alternatives).toContain(Constant.Site_Url + 'invoiceHeaderImage/school-A/logo.png');
  });
});
