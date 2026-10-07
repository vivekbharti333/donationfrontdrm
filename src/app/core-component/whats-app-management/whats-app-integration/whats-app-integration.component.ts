import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { finalize, takeUntil, timeout } from 'rxjs/operators';
import { Constant } from 'src/app/core/constant/constants';
import { FacebookSdkService } from './facebook-sdk.service';

interface WhatsAppConnection {
  businessName: string | null;
  displayName: string | null;
  displayNameStatus: string | null;
  phoneNumber: string | null;
  phoneNumberId: string | null;
  wabaId: string | null;
  businessId: string | null;
}
interface SignupDetails { phoneNumberId: string; wabaId: string; businessId: string | null; }

@Component({
  selector: 'app-whats-app-integration',
  templateUrl: './whats-app-integration.component.html',
  styleUrls: ['./whats-app-integration.component.scss']
})
export class WhatsAppIntegrationComponent implements OnInit, OnDestroy {
  private readonly CONFIG_ID = '4471781046413650';
  private readonly apiUrl = `${Constant.Site_Url}api/whatsapp`;
  private readonly destroyed$ = new Subject<void>();
  private destroyed = false;
  private attempt = 0;
  private signupTimer?: number;
  private code: string | null = null;
  private signup: SignupDetails | null = null;
  private exchanging = false;
  private readonly embeddedSignupListener = (event: MessageEvent) => this.captureEmbeddedSignup(event);

  isConnecting = false;
  isSendingTest = false;
  isConnected = false;
  isLoading = true;
  isSdkReady = false;
  statusKnown = false;
  errorMessage = '';
  successMessage = '';
  registrationPin = '';
  whatsappData: WhatsAppConnection = this.emptyConnection();

  constructor(private http: HttpClient, private zone: NgZone,
    private cookieService: CookieService, private sdk: FacebookSdkService) {}

  ngOnInit(): void {
    window.addEventListener('message', this.embeddedSignupListener);
    this.sdk.load().then(() => this.zone.run(() => {
      if (!this.destroyed) this.isSdkReady = true;
    })).catch((error: Error) => this.zone.run(() => {
      if (!this.destroyed) this.errorMessage = error.message;
    }));
    this.loadExistingConnection();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.attempt++;
    this.clearSignupTimer();
    window.removeEventListener('message', this.embeddedSignupListener);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadExistingConnection(): void {
    if (this.isConnecting) return;
    this.isLoading = true;
    this.statusKnown = false;
    this.http.get<any>(`${this.apiUrl}/status`, this.authOptions()).pipe(
      timeout(30000), takeUntil(this.destroyed$), finalize(() => this.isLoading = false)
    ).subscribe({
      next: (raw) => {
        const res = this.responseData(raw);
        const connection = this.mapConnection(res);
        if (!this.responseSucceeded(raw) || typeof res?.connected !== 'boolean' ||
          (res.connected && (!connection.wabaId || !connection.phoneNumberId))) {
          this.errorMessage = 'The server returned an invalid connection status. Please check again.';
          return;
        }
        this.statusKnown = true;
        this.errorMessage = res.setupPending ? 'Your details are saved, but Meta setup is incomplete. Complete phone setup, wait three minutes, then reconnect to finish.' : '';
        this.isConnected = res.connected;
        this.whatsappData = res.connected ? connection : this.emptyConnection();
      },
      error: (err) => {
        const reasons: Record<number, string> = {
          0: 'The WhatsApp status API could not be reached. Check the backend URL, network and CORS configuration.',
          401: 'Your session has expired. Sign in again to check WhatsApp status.',
          403: 'The backend denied access to WhatsApp status. Check this user\'s account permissions.',
          404: 'The WhatsApp status API was not found. Deploy the updated backend and verify its URL.'
        };
        this.errorMessage = reasons[err.status] || this.getErrorMessage(err, 'The WhatsApp status API failed. Check backend logs and the onboarding database migration.');
      }
    });
  }

  connectWhatsApp(): void {
    if (this.isConnecting || this.isLoading || !this.statusKnown || this.isConnected) return;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.cookieService.get('token')) {
      this.errorMessage = 'Your session has expired. Please sign in again.';
      return;
    }
    if (!this.isSdkReady || !(window as any).FB) {
      this.errorMessage = 'Facebook connection tools are still loading. Please refresh and try again.';
      return;
    }
    if (this.registrationPin && !/^[0-9]{6}$/.test(this.registrationPin)) {
      this.errorMessage = 'The existing two-step verification PIN must contain six digits.';
      return;
    }
    this.code = null;
    this.signup = null;
    this.exchanging = false;
    this.isConnecting = true;
    const attempt = ++this.attempt;
    this.signupTimer = window.setTimeout(() => this.zone.run(() => {
      this.failSignup('Signup timed out. Close the Meta popup and try again.');
    }), 180000);
    try {
      (window as any).FB.login((response: any) => this.zone.run(() => {
        if (this.destroyed || attempt !== this.attempt || !this.isConnecting || this.exchanging) return;
        const code = response?.authResponse?.code;
        if (typeof code !== 'string' || !code) {
          this.failSignup('Connection was cancelled or permission was not granted.');
          return;
        }
        this.code = code;
        this.clearSignupTimer();
        this.signupTimer = window.setTimeout(() => this.zone.run(() => {
          this.failSignup('Meta did not return the selected WhatsApp account and phone number. Please try again.');
        }), 15000);
        this.completeSignup();
      }), {
        config_id: this.CONFIG_ID, response_type: 'code', override_default_response_type: true,
        extras: { setup: {}, sessionInfoVersion: 3 }
      });
    } catch {
      this.failSignup('Unable to open Meta signup. Please refresh and try again.');
    }
  }

  private completeSignup(): void {
    if (!this.code || !this.signup || this.exchanging) return;
    this.clearSignupTimer();
    this.exchanging = true;
    const selected = this.signup;
    const code = this.code;
    this.code = null;
    this.http.post<any>(`${this.apiUrl}/exchange-code`, {
      code, ...selected, signupEvent: 'FINISH', graphApiVersion: 'v24.0',
      ...(this.registrationPin ? { registrationPin: this.registrationPin } : {})
    }, this.authOptions()).pipe(
      timeout(180000), takeUntil(this.destroyed$), finalize(() => {
        this.isConnecting = false;
        this.exchanging = false;
        this.signup = null;
        this.registrationPin = '';
      })
    ).subscribe({
      next: (raw) => {
        const res = this.responseData(raw);
        const connection = this.mapConnection(res);
        if (!this.responseSucceeded(raw) || res?.connected !== true ||
          connection.wabaId !== selected.wabaId || connection.phoneNumberId !== selected.phoneNumberId) {
          this.statusKnown = false;
          this.errorMessage = 'The server did not confirm saving the selected WhatsApp connection. Check connection status before trying again.';
          return;
        }
        this.isConnected = true;
        this.statusKnown = true;
        this.whatsappData = connection;
        this.successMessage = 'WhatsApp connection saved. Send a test receipt to verify messaging.';
      },
      error: (err) => {
        this.statusKnown = false;
        this.errorMessage = this.getErrorMessage(err, 'Saving the connection could not be confirmed. Check connection status before trying again.');
      }
    });
  }

  sendTestMessage(): void {
    if (!this.isConnected || !this.statusKnown || this.isSendingTest || this.isConnecting) return;
    const input = prompt('Enter the WhatsApp recipient number with country code (for example 919876543210):');
    if (!input) return;
    const recipient = input.trim().replace(/^\+/, '');
    this.errorMessage = '';
    this.successMessage = '';
    if (!/^[1-9]\d{6,14}$/.test(recipient)) {
      this.errorMessage = 'Enter 7 to 15 digits with country code, without spaces or punctuation.';
      return;
    }
    this.isSendingTest = true;
    this.http.post<any>(`${this.apiUrl}/send-test`, { recipient }, this.authOptions()).pipe(
      timeout(30000), takeUntil(this.destroyed$), finalize(() => this.isSendingTest = false)
    ).subscribe({
      next: (raw) => {
        const res = this.responseData(raw);
        const messageId = res?.messageId ?? res?.message_id ?? res?.messages?.[0]?.id;
        if (!this.responseSucceeded(raw) || typeof messageId !== 'string' || !messageId) {
          this.errorMessage = 'The server did not confirm Meta accepted the test message. Check delivery logs before retrying.';
          return;
        }
        this.successMessage = 'Meta accepted the test receipt. Check the recipient’s WhatsApp to confirm delivery.';
      },
      error: (err) => this.errorMessage = this.getErrorMessage(err, 'Test message acceptance could not be confirmed. Check delivery logs before retrying.')
    });
  }

  disconnectWhatsApp(): void {
    if (this.isConnecting || this.isSendingTest || this.isLoading) return;
    if (!confirm('Disconnect WhatsApp? Automated donation receipts will stop.')) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.isConnecting = true;
    this.http.post<any>(`${this.apiUrl}/disconnect`, {}, this.authOptions()).pipe(
      timeout(30000), takeUntil(this.destroyed$), finalize(() => this.isConnecting = false)
    ).subscribe({
      next: (raw) => {
        const res = this.responseData(raw);
        if (!this.responseSucceeded(raw) || res?.connected !== false) {
          this.statusKnown = false;
          this.errorMessage = 'The server did not confirm disconnection. Check connection status.';
          return;
        }
        this.isConnected = false;
        this.statusKnown = true;
        this.whatsappData = this.emptyConnection();
        this.successMessage = 'WhatsApp disconnected.';
      },
      error: (err) => {
        this.statusKnown = false;
        this.errorMessage = this.getErrorMessage(err, 'Disconnection could not be confirmed. Check connection status.');
      }
    });
  }

  private captureEmbeddedSignup(event: MessageEvent): void {
    if (!this.isConnecting || this.exchanging || this.destroyed) return;
    if (!['https://www.facebook.com', 'https://web.facebook.com', 'https://facebook.com'].includes(event.origin)) return;
    let payload: any = event.data;
    try { if (typeof payload === 'string') payload = JSON.parse(payload); } catch { return; }
    if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return;
    this.zone.run(() => {
      if (payload.event === 'CANCEL' || payload.event === 'ERROR') {
        this.failSignup(payload.event === 'CANCEL' ? 'Meta signup was cancelled.' : 'Meta could not complete signup. Please try again.');
        return;
      }
      if (payload.event === 'FINISH_ONLY_WABA' || payload.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
        this.failSignup('This signup requires a different Meta setup flow. Use standard signup with a verified phone number.');
        return;
      }
      if (payload.event !== 'FINISH') return;
      const phoneNumberId = this.metaId(payload.data?.phone_number_id);
      const wabaId = this.metaId(payload.data?.waba_id);
      if (!phoneNumberId || !wabaId) {
        this.failSignup('Meta signup did not include a WhatsApp account and phone number. Please complete phone number setup.');
        return;
      }
      this.signup = { phoneNumberId, wabaId, businessId: this.metaId(payload.data?.business_id) };
      this.completeSignup();
    });
  }

  private failSignup(message: string): void {
    this.clearSignupTimer();
    this.attempt++;
    this.isConnecting = false;
    this.code = null;
    this.signup = null;
    this.errorMessage = message;
  }
  private clearSignupTimer(): void {
    if (this.signupTimer !== undefined) window.clearTimeout(this.signupTimer);
    this.signupTimer = undefined;
  }
  private metaId(value: unknown): string | null {
    return typeof value === 'string' && /^\d+$/.test(value) ? value : null;
  }
  private responseData(res: any): any { return res?.payload ?? res; }
  private responseSucceeded(res: any): boolean {
    return !!res && !res.error && res.success !== false &&
      (res.responseCode == null || Number(res.responseCode) === 200) &&
      !this.responseData(res)?.error && this.responseData(res)?.success !== false;
  }
  private mapConnection(res: any): WhatsAppConnection {
    return {
      businessName: res?.businessName ?? res?.business_name ?? null,
      displayName: res?.displayName ?? res?.display_name ?? null,
      displayNameStatus: res?.displayNameStatus ?? res?.display_name_status ?? null,
      phoneNumber: res?.phoneNumber ?? res?.phone_number ?? null,
      phoneNumberId: this.metaId(res?.phoneNumberId ?? res?.phone_number_id),
      wabaId: this.metaId(res?.wabaId ?? res?.waba_id),
      businessId: this.metaId(res?.businessId ?? res?.business_id)
    };
  }
  private emptyConnection(): WhatsAppConnection {
    return { businessName: null, displayName: null, displayNameStatus: null, phoneNumber: null, phoneNumberId: null, wabaId: null, businessId: null };
  }
  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    if (typeof err.error === 'string') return err.error || fallback;
    const message = err.error?.message ?? err.error?.error?.message ?? err.error?.error;
    return typeof message === 'string' ? message : fallback;
  }
  private authOptions(): { headers: HttpHeaders } {
    const token = this.cookieService.get('token');
    return { headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders() };
  }
}
