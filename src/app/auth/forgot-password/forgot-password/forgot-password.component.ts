import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../authenticationService/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [MessageService],
})
export class ForgotPasswordComponent {
  public routes = routes;
  public sendOtpForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userManagementService: UserManagementService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) { }


  ngOnInit(): void {
    // Opening this page starts a new reset-password flow and invalidates stale OTP state.
    this.authenticationService.clearResetFlow();
    this.createForms();
  }

  createForms() {
    this.sendOtpForm = this.fb.group({
      mobileNo: ['', [Validators.required]],
      requestedFor: ['RESET_PASS']
    });
  }

  removeLoginIdSpaces(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.replace(/\s+/g, '');
    input.value = sanitizedValue;
    this.sendOtpForm.patchValue({ mobileNo: sanitizedValue }, { emitEvent: false });
  }

  sendOtp() {
    const loginId = String(this.sendOtpForm.value.mobileNo || '').replace(/\s+/g, '');
    this.sendOtpForm.patchValue({ mobileNo: loginId }, { emitEvent: false });

    if (this.sendOtpForm.invalid) {
      this.sendOtpForm.markAllAsTouched();
      return;
    }

    this.userManagementService.sendOtp(this.sendOtpForm.value)
      .subscribe({
        next: (response: any) => {
          const responseCode = Number(response?.responseCode);
          const respCode = Number(response?.payload?.respCode);
          const respMesg = response?.payload?.respMesg
            || response?.responseMessage
            || response?.responseMesg
            || 'Unable to send OTP.';

          if (responseCode === 200) {
            if (respCode === 200) {

              this.authenticationService.setResetMobileNo(this.sendOtpForm.value.mobileNo);
              this.authenticationService.setOtpSent(true);
              this.authenticationService.setOtpExpiry();


              this.router.navigate([routes.otpVerification], {
                state: {
                  mobileNo: this.sendOtpForm.value.mobileNo
                }
              });
              this.messageService.add({ severity: 'success', summary: 'Success', detail: respMesg });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: String(response?.payload?.respCode || 'Error'),
                detail: respMesg,
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: String(response?.responseCode || 'Error'),
              detail: respMesg,
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: (error: any) => this.messageService.add({
          severity: 'error',
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
      });
  }
}
