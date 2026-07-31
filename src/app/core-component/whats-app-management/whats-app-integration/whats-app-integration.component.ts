import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var FB: any;

@Component({
  selector: 'app-whats-app-integration',
  templateUrl: './whats-app-integration.component.html',
  styleUrls: ['./whats-app-integration.component.scss']
})
export class WhatsAppIntegrationComponent implements OnInit {

  private readonly APP_ID = '1222137563317496';
  private readonly CONFIG_ID = '4471781046413650';

  isConnecting = false;
  isConnected = false;

  whatsappData: any = {
    businessName: null,
    displayName: null,
    displayNameStatus: null,
    phoneNumber: null,
    phoneNumberId: null,
    wabaId: null
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // 1. Load Facebook SDK v4
    this.loadFacebookSDK();
    // 2. Load existing connection status from your Java backend
    this.loadExistingConnection();
  }

  private loadFacebookSDK(): void {
    if ((window as any).FB) {
      return; // Already loaded
    }

    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: this.APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v20.0'
      });
      console.log('Facebook SDK initialized for Embedded Signup v4');
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  private loadExistingConnection(): void {
    // This API you need to create in Spring MVC - GET /api/whatsapp/status
    this.http.get('/api/whatsapp/status').subscribe({
      next: (res: any) => {
        if (res && res.connected) {
          this.isConnected = true;
          this.whatsappData = res;
        }
      },
      error: (err) => {
        console.log('No existing WhatsApp connection', err);
      }
    });
  }

  connectWhatsApp(): void {
    // Check FB SDK loaded
    if (!(window as any).FB) {
      alert('Facebook SDK is still loading. Please wait 2 seconds and try again.');
      return;
    }

    FB.login((response: any) => {
      console.log('========================================');
      console.log('Embedded Signup v4 Response');
      console.log('Full Response:', response);
      console.log('========================================');

      if (response.authResponse && response.authResponse.code) {
        const code = response.authResponse.code;
        console.log('Authorization Code Received:', code);

        this.isConnecting = true;

        this.http.post('/api/whatsapp/exchange-code', {
          code: code,
          ngoId: localStorage.getItem('ngoId')
        }).subscribe({
          next: (res: any) => {
            console.log('Backend Exchange Success:', res);
            this.isConnecting = false;
            this.isConnected = true;
            this.whatsappData = {
              businessName: res.business_name,
              displayName: res.display_name,
              displayNameStatus: res.display_name_status || 'PENDING',
              phoneNumber: res.phone_number,
              phoneNumberId: res.phone_number_id,
              wabaId: res.waba_id
            };
            alert(`Connected! Display Name: ${res.display_name}`);
          },
          error: (err) => {
            console.error('Backend Exchange Failed:', err);
            this.isConnecting = false;
            alert('Failed to complete connection: ' + (err.error?.error || err.message));
          }
        });

      } else {
        console.warn('User cancelled or did not authorize:', response);
        alert('Connection cancelled. Please try again to connect your NGO WhatsApp.');
      }
    }, {
      config_id: this.CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        sessionInfoVersion: 3
      }
    });
  }

  sendTestMessage(): void {
    if (!confirm(`Send test donation receipt to your number from ${this.whatsappData.displayName}?`)) {
      return;
    }
    this.http.post('/api/whatsapp/send-test', {}).subscribe({
      next: () => alert('Test receipt sent! Check WhatsApp.'),
      error: (err) => alert('Failed to send test: ' + err.message)
    });
  }

  disconnectWhatsApp(): void {
    if (!confirm('Are you sure you want to disconnect? Donation receipts will stop sending from your NGO name.')) {
      return;
    }
    this.http.post('/api/whatsapp/disconnect', {}).subscribe({
      next: () => {
        this.isConnected = false;
        this.whatsappData = {};
        alert('Disconnected successfully');
      },
      error: (err) => alert('Failed to disconnect: ' + err.message)
    });
  }
}