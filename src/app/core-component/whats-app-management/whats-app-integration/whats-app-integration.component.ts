import { Component, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Constant } from 'src/app/core/constant/constants';

declare const FB: any;

interface WhatsAppConnection {
  businessName: string | null;
  displayName: string | null;
  displayNameStatus: string | null;
  phoneNumber: string | null;
  phoneNumberId: string | null;
  wabaId: string | null;
}

@Component({
  selector: 'app-whats-app-integration',
  templateUrl: './whats-app-integration.component.html',
  styleUrls: ['./whats-app-integration.component.scss']
})
export class WhatsAppIntegrationComponent implements OnInit {
  private readonly APP_ID = '1222137563317496';
  private readonly CONFIG_ID = '4471781046413650';
  private readonly apiUrl = `${Constant.Site_Url}api/whatsapp`;

  isConnecting = false;
  isConnected = false;
  isLoading = true;
  isSdkReady = false;
  errorMessage = '';

  whatsappData: WhatsAppConnection = this.emptyConnection();

  constructor(private http: HttpClient, private zone: NgZone) {}

  ngOnInit(): void {
    this.loadFacebookSDK();
    this.loadExistingConnection();
  }

  private loadFacebookSDK(): void {
    if ((window as any).FB) {
      this.initializeFacebookSDK();
      return;
    }

    (window as any).fbAsyncInit = () => this.zone.run(() => this.initializeFacebookSDK());

    const existingScript = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('error', () => this.handleSdkError());
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => this.zone.run(() => this.handleSdkError());
    document.body.appendChild(script);
  }

  private initializeFacebookSDK(): void {
    (window as any).FB.init({
      appId: this.APP_ID,
      autoLogAppEvents: true,
      xfbml: false,
      version: 'v20.0'
    });
    this.isSdkReady = true;
  }

  private handleSdkError(): void {
    this.isSdkReady = false;
    this.errorMessage = 'Facebook connection tools could not be loaded. Check your network and refresh the page.';
  }

  private loadExistingConnection(): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/status`).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res) => {
        this.isConnected = Boolean(res?.connected);
        this.whatsappData = this.isConnected ? this.mapConnection(res) : this.emptyConnection();
      },
      error: (err: HttpErrorResponse) => {
        this.isConnected = false;
        if (err.status !== 404) {
          this.errorMessage = this.getErrorMessage(err, 'Unable to check the WhatsApp connection status.');
        }
      }
    });
  }

  connectWhatsApp(): void {
    this.errorMessage = '';
    if (!this.isSdkReady || !(window as any).FB) {
      this.errorMessage = 'Facebook connection tools are still loading. Please try again shortly.';
      return;
    }

    (window as any).FB.login((response: any) => this.zone.run(() => {
      const code = response?.authResponse?.code;
      if (!code) {
        this.errorMessage = 'Connection was cancelled or permission was not granted.';
        return;
      }

      this.isConnecting = true;
      this.http.post<any>(`${this.apiUrl}/exchange-code`, {
        code,
        ngoId: localStorage.getItem('ngoId')
      }).pipe(finalize(() => this.isConnecting = false)).subscribe({
        next: (res) => {
          this.isConnected = true;
          this.whatsappData = this.mapConnection(res);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(err, 'We could not complete the WhatsApp connection.');
        }
      });
    }), {
      config_id: this.CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {}, sessionInfoVersion: 3 }
    });
  }

  sendTestMessage(): void {
    if (!confirm(`Send a test donation receipt from ${this.whatsappData.displayName || 'this WhatsApp account'}?`)) return;

    this.errorMessage = '';
    this.http.post(`${this.apiUrl}/send-test`, {}).subscribe({
      next: () => alert('Test receipt sent. Please check WhatsApp.'),
      error: (err: HttpErrorResponse) => this.errorMessage = this.getErrorMessage(err, 'The test receipt could not be sent.')
    });
  }

  disconnectWhatsApp(): void {
    if (!confirm('Disconnect WhatsApp? Automated donation receipts will stop.')) return;

    this.errorMessage = '';
    this.isConnecting = true;
    this.http.post(`${this.apiUrl}/disconnect`, {}).pipe(
      finalize(() => this.isConnecting = false)
    ).subscribe({
      next: () => {
        this.isConnected = false;
        this.whatsappData = this.emptyConnection();
      },
      error: (err: HttpErrorResponse) => this.errorMessage = this.getErrorMessage(err, 'WhatsApp could not be disconnected.')
    });
  }

  private mapConnection(res: any): WhatsAppConnection {
    return {
      businessName: res?.businessName ?? res?.business_name ?? null,
      displayName: res?.displayName ?? res?.display_name ?? null,
      displayNameStatus: res?.displayNameStatus ?? res?.display_name_status ?? null,
      phoneNumber: res?.phoneNumber ?? res?.phone_number ?? null,
      phoneNumberId: res?.phoneNumberId ?? res?.phone_number_id ?? null,
      wabaId: res?.wabaId ?? res?.waba_id ?? null
    };
  }

  private emptyConnection(): WhatsAppConnection {
    return { businessName: null, displayName: null, displayNameStatus: null, phoneNumber: null, phoneNumberId: null, wabaId: null };
  }

  private getErrorMessage(err: HttpErrorResponse, fallback: string): string {
    return err.error?.message || err.error?.error || fallback;
  }
}
