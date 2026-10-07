import { fakeAsync, tick } from '@angular/core/testing';
import { FacebookSdkService } from './facebook-sdk.service';

describe('FacebookSdkService', () => {
  let previousFB: any;
  beforeEach(() => previousFB = (window as any).FB);
  afterEach(() => (window as any).FB = previousFB);
  it('initializes v24.0 once for repeated callers', fakeAsync(() => {
    const init = jasmine.createSpy('init'); (window as any).FB = { init };
    const service = new FacebookSdkService();
    expect(service.load()).toBe(service.load()); tick();
    expect(init).toHaveBeenCalledOnceWith({ appId: '1222137563317496', xfbml: false, version: 'v24.0' });
  }));
  it('reuses an existing script and reports a timeout', fakeAsync(() => {
    (window as any).FB = undefined;
    const script = document.createElement('script'); script.id = 'facebook-jssdk'; document.body.appendChild(script);
    let failure = '';
    new FacebookSdkService().load().catch(error => failure = error.message);
    tick(20000);
    expect(failure).toContain('could not be loaded');
    expect(document.querySelectorAll('#facebook-jssdk').length).toBe(1);
    script.remove();
  }));
});
