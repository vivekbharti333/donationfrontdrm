import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmailSettingsService } from './email-settings.service';

interface EmailProvider {
  name: string;
  code: string;
  aliases: string[];
}

@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrl: './email-settings.component.scss',
})
export class EmailSettingsComponent {
  public addEmailForm!: FormGroup;
  public isLoading = false;
  public isFetching = false;
  public errorMessage = '';
  public emailDetailsList: any[] = [];
  public selectedProvider: EmailProvider | null = null;
  public providers: EmailProvider[] = [
    { name: 'SMTP', code: 'NIMBUZ', aliases: ['NIMBUZ', 'SMTP'] },
    { name: 'Brevo Mailer', code: 'PHP', aliases: ['PHP', 'BREVO'] },
    { name: 'Zoho Mail', code: 'ZOHO', aliases: ['ZOHO'] },
    { name: 'SendGrid', code: 'SENDGRID', aliases: ['SENDGRID'] },
  ];
  public fields = [
    { name: 'emailType', label: 'Email Type', type: 'text' },
    { name: 'host', label: 'Host', type: 'text' },
    { name: 'port', label: 'Port', type: 'text' },
    { name: 'emailUserid', label: 'User Id', type: 'text' },
    { name: 'emailPassword', label: 'Password', type: 'password' },
    { name: 'emailFrom', label: 'Email From', type: 'email' },
    { name: 'subject', label: 'Subject', type: 'text' },
    { name: 'emailBody', label: 'Message / Template Id', type: 'text' },
  ];

  constructor(
    private fb: FormBuilder,
    private emailSettingsService: EmailSettingsService,
  ) {}

  ngOnInit() {
    this.createForms();
    this.getEmailServiceDetailsList();
  }

  createForms() {
    this.addEmailForm = this.fb.group({
      serviceProvider: [''],
      status: [''],
      emailType: ['DONATION_RECEIPT', Validators.required],
      host: ['', Validators.required],
      port: ['', Validators.required],
      emailUserid: ['', Validators.required],
      emailPassword: ['', Validators.required],
      emailFrom: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      emailBody: ['', Validators.required],
    });
  }

  getProviderDetails(provider: EmailProvider): any | undefined {
    return this.emailDetailsList.find(details =>
      provider.aliases.includes(String(details?.serviceProvider ?? '').trim().toUpperCase())
    );
  }

  openProvider(provider: EmailProvider) {
    this.selectedProvider = provider;
    this.errorMessage = '';
    // Reset first so a new connection never displays another provider's values.
    this.addEmailForm.reset({
      serviceProvider: provider.code,
      emailType: 'DONATION_RECEIPT',
      status: '',
    });
    const details = this.getProviderDetails(provider);
    if (details) {
      this.addEmailForm.patchValue(details);
    }
  }

  addUpdateEmailServiceDetails() {
    if (this.isLoading) return;
    if (this.addEmailForm.invalid) {
      this.addEmailForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.emailSettingsService.addUpdateEmailServiceDetails(this.addEmailForm.getRawValue())
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          if (String(response?.responseCode) === '200' && String(response?.payload?.respCode) === '200') {
            this.getEmailServiceDetailsList();
          } else {
            this.errorMessage = 'Unable to save email settings. Please try again.';
          }
        },
        error: () => this.errorMessage = 'Unable to save email settings. Please try again.',
      });
  }

  public getEmailServiceDetailsList() {
    this.isFetching = true;
    this.emailSettingsService.getEmailServiceDetailsList()
      .pipe(finalize(() => this.isFetching = false))
      .subscribe({
        next: (response: any) => {
          if (String(response?.responseCode) === '200') {
            this.emailDetailsList = Array.isArray(response.listPayload) ? response.listPayload : [];
          } else {
            this.errorMessage = 'Unable to load email settings. Please try again.';
          }
        },
        error: () => this.errorMessage = 'Unable to load email settings. Please try again.',
      });
  }
}