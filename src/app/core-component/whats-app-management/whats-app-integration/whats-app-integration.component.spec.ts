import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { WhatsAppIntegrationComponent } from './whats-app-integration.component';
import { FacebookSdkService } from './facebook-sdk.service';

describe('WhatsApp onboarding', () => {
  let component: WhatsAppIntegrationComponent;
  let http: HttpTestingController;
  let callback: (response: any) => void;
  let login: jasmine.Spy;
  let previousFB: any;
  const saved = { connected: true, phoneNumberId: '123', wabaId: '456', businessId: '789' };
  const finish = (origin = 'https://www.facebook.com', event = 'FINISH') => window.dispatchEvent(new MessageEvent('message', {
    origin, data: JSON.stringify({ type: 'WA_EMBEDDED_SIGNUP', event, data: { phone_number_id: '123', waba_id: '456', business_id: '789' } })
  }));
  const authorize = () => callback({ authResponse: { code: 'authorization-code' } });
  const exchange = () => http.expectOne(req => req.url.endsWith('/exchange-code'));
  beforeEach(() => {
    previousFB = (window as any).FB;
    login = jasmine.createSpy('login').and.callFake((cb: any) => callback = cb);
    (window as any).FB = { login };
    TestBed.configureTestingModule({
      declarations: [WhatsAppIntegrationComponent], imports: [CommonModule, HttpClientTestingModule],
      providers: [
        { provide: FacebookSdkService, useValue: { load: () => Promise.resolve() } },
        { provide: CookieService, useValue: { get: () => 'tenant-auth-token' } }
      ]
    });
    const fixture = TestBed.createComponent(WhatsAppIntegrationComponent);
    component = fixture.componentInstance; http = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); http.expectOne(req => req.url.endsWith('/status')).flush({ connected: false });
    component.isSdkReady = true;
  });
  afterEach(() => { component.ngOnDestroy(); http.verify(); (window as any).FB = previousFB; });
  it('waits for signup details after authorization and sends all IDs', () => {
    component.connectWhatsApp(); authorize(); http.expectNone(req => req.url.endsWith('/exchange-code')); finish();
    const req = exchange(); expect(req.request.headers.get('Authorization')).toBe('Bearer tenant-auth-token');
    expect(req.request.body).toEqual({ code: 'authorization-code', phoneNumberId: '123', wabaId: '456', businessId: '789', signupEvent: 'FINISH', graphApiVersion: 'v24.0' });
    req.flush(saved); expect(component.isConnected).toBeTrue();
  });
  it('waits for authorization after signup details', () => {
    component.connectWhatsApp(); finish(); http.expectNone(req => req.url.endsWith('/exchange-code'));
    authorize(); exchange().flush(saved); expect(component.isConnected).toBeTrue();
  });
  it('rejects spoofed origins and inactive messages', () => {
    finish(); component.connectWhatsApp(); authorize(); finish('https://fakefacebook.com');
    http.expectNone(req => req.url.endsWith('/exchange-code')); finish(); exchange().flush(saved); expect(component.isConnected).toBeTrue();
  });
  it('blocks duplicate popups and exchanges', () => {
    component.connectWhatsApp(); component.connectWhatsApp(); finish(); authorize(); finish(); authorize();
    expect(login).toHaveBeenCalledTimes(1); exchange().flush(saved);
  });
  it('ignores a cancelled attempt callback', () => {
    component.connectWhatsApp(); const old = callback; finish('https://www.facebook.com', 'CANCEL');
    component.connectWhatsApp(); old({ authResponse: { code: 'stale' } }); finish();
    http.expectNone(req => req.url.endsWith('/exchange-code')); authorize(); exchange().flush(saved); expect(component.isConnected).toBeTrue();
  });
  it('times out missing details without exchanging', fakeAsync(() => {
    component.connectWhatsApp(); authorize(); tick(15000);
    expect(component.isConnecting).toBeFalse(); http.expectNone(req => req.url.endsWith('/exchange-code'));
  }));
  it('rejects a saved response for another account', () => {
    component.connectWhatsApp(); finish(); authorize(); exchange().flush({ ...saved, wabaId: '999' });
    expect(component.isConnected).toBeFalse(); expect(component.statusKnown).toBeFalse();
  });
  it('reconciles status after an uncertain save', () => {
    component.connectWhatsApp(); finish(); authorize(); exchange().flush({}, { status: 500, statusText: 'Error' });
    component.connectWhatsApp(); expect(login).toHaveBeenCalledTimes(1); component.loadExistingConnection();
    http.expectOne(req => req.url.endsWith('/status')).flush(saved); expect(component.isConnected).toBeTrue();
  });
  it('blocks signup when status cannot be checked', () => {
    component.loadExistingConnection(); http.expectOne(req => req.url.endsWith('/status')).flush({}, { status: 404, statusText: 'Not found' });
    component.connectWhatsApp(); expect(login).not.toHaveBeenCalled();
  });
  it('validates recipients and requires a Meta message ID', () => {
    component.isConnected = true; const promptSpy = spyOn(window, 'prompt').and.returnValue('invalid');
    component.sendTestMessage(); http.expectNone(req => req.url.endsWith('/send-test'));
    promptSpy.and.returnValue('+919876543210'); component.sendTestMessage();
    const req = http.expectOne(req => req.url.endsWith('/send-test')); expect(req.request.body.recipient).toBe('919876543210');
    req.flush({ success: false }); expect(component.successMessage).toBe('');
    component.sendTestMessage(); http.expectOne(req => req.url.endsWith('/send-test')).flush({ messages: [{ id: 'wamid.test' }] });
    expect(component.successMessage).toContain('accepted');
  });
  it('validates and forwards an existing registration PIN', () => {
    component.registrationPin = 'bad'; component.connectWhatsApp(); expect(login).not.toHaveBeenCalled();
    component.registrationPin = '123456'; component.connectWhatsApp(); finish(); authorize();
    const request = exchange(); expect(request.request.body.registrationPin).toBe('123456'); request.flush(saved);
    expect(component.registrationPin).toBe('');
  });
  it('reports partial provisioning after a status check', () => {
    component.loadExistingConnection(); http.expectOne(req => req.url.endsWith('/status')).flush({ connected: false, setupPending: true });
    expect(component.errorMessage).toContain('setup is incomplete'); expect(component.isConnected).toBeFalse();
  });
  it('can reset expired authorization when status verification fails', () => {
    component.statusKnown = false; spyOn(window, 'confirm').and.returnValue(true); component.disconnectWhatsApp();
    http.expectOne(req => req.url.endsWith('/disconnect')).flush({ connected: false });
    expect(component.statusKnown).toBeTrue(); expect(component.isConnected).toBeFalse();
  });
  it('requires confirmed disconnection', () => {
    component.isConnected = true; spyOn(window, 'confirm').and.returnValue(true); component.disconnectWhatsApp();
    http.expectOne(req => req.url.endsWith('/disconnect')).flush({ success: false });
    expect(component.isConnected).toBeTrue(); expect(component.statusKnown).toBeFalse();
  });
});
