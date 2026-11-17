import { fakeAsync, tick } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NEVER, of, throwError } from 'rxjs';
import { ReceiptComponent } from './receipt.component';
import { ThankYouService } from '../thank-you.service';

describe('ReceiptComponent', () => {
  let component: ReceiptComponent;
  let service: jasmine.SpyObj<ThankYouService>;

  function start(receiptNo?: string): void {
    const route = { queryParamMap: of(convertToParamMap(receiptNo ? { receiptNo } : {})) };
    component = new ReceiptComponent(service, route as ActivatedRoute);
    component.ngOnInit();
  }

  beforeEach(() => service = jasmine.createSpyObj('ThankYouService', ['downloadPdf']));
  afterEach(() => component.ngOnDestroy());

  it('shows missing receipt number without calling the API', () => {
    start();
    expect(component.successMessageVisible).toContain('No receipt number');
    expect(service.downloadPdf).not.toHaveBeenCalled();
  });

  it('calls the public PDF API and shows download errors', fakeAsync(() => {
    service.downloadPdf.and.returnValue(throwError(() => ({ status: 404 })));
    start('12345');
    tick(5000);
    expect(service.downloadPdf).toHaveBeenCalledOnceWith('12345');
    expect(component.successMessageVisible).toContain('Receipt not found');
    expect(component.countShow).toBeFalse();
  }));

  it('rejects an HTML error page returned as a successful response', fakeAsync(() => {
    service.downloadPdf.and.returnValue(of(new HttpResponse({ body: new Blob(['Invalid request'], { type: 'text/html' }) })));
    start('12345');
    tick(5000);
    expect(component.successMessageVisible).toContain('No PDF receipt');
  }));

  it('downloads a valid PDF', fakeAsync(() => {
    service.downloadPdf.and.returnValue(of(new HttpResponse({
      body: new Blob(['pdf'], { type: 'application/pdf' }),
      headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename="donation.pdf"' })
    })));
    const save = spyOn<any>(ReceiptComponent.prototype, 'saveFile');
    start('12345');
    tick(5000);
    expect(save).toHaveBeenCalled();
    expect(component.successMessageVisible).toContain('has been downloaded');
  }));

  it('shows an error when the download times out', fakeAsync(() => {
    service.downloadPdf.and.returnValue(NEVER);
    start('12345');
    tick(35000);
    expect(component.successMessageVisible).toContain('Unable to download');
  }));

  it('cancels the countdown when leaving the page', fakeAsync(() => {
    start('12345');
    component.ngOnDestroy();
    tick(5000);
    expect(service.downloadPdf).not.toHaveBeenCalled();
  }));
});
