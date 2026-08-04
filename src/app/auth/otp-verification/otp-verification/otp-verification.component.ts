import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { MessageService } from 'primeng/api';
  import { AuthenticationService } from '../../authenticationService/authentication.service';
import { CommonComponentService } from 'src/app/common-component/common-component.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss',
  providers: [MessageService],
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  public routes = routes;
  public verifyOtpForm!: FormGroup;

  displayTime: string = '02:00';
  public totalSeconds = 120; // 2 minutes
  public isResending = false;
  private timer?: ReturnType<typeof setInterval>;
  private otpExpiresAt = 0;
// isOtpExpired = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userManagementService: UserManagementService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.createForms();

    const mobileNo = history.state.mobileNo ?? this.authenticationService.getResetMobileNo();
    if (mobileNo) {
      this.verifyOtpForm.patchValue({
        mobileNo: mobileNo
      });
    }

    this.startCountdown();
  }

  createForms() {
    this.verifyOtpForm = this.fb.group({
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      requestedFor: ['RESET_PASS']
    });
  }

  moveNext(event: any, next?: HTMLInputElement) {
  const input = event.target;
  if (input.value.length === 1 && next) {
    next.focus();
  }
  this.updateOtp();
}

updateOtp() {
  const inputs = document.querySelectorAll('.forms-block input');
  let otp = '';
  inputs.forEach((input: any) => {
    otp += input.value;
  });
  this.verifyOtpForm.patchValue({
    otp: otp
  });
}

  verifyOtp() {
    if (this.verifyOtpForm.invalid) {
      this.verifyOtpForm.markAllAsTouched();
      return;
    }

    this.userManagementService.verifyOtp(this.verifyOtpForm.value)
      .subscribe({
        next: (response: any) => {

          if (response.responseCode === 200) {
            if (response.payload.respCode === 200) {

              this.authenticationService.setOtpVerified(true);
              sessionStorage.removeItem('otpExpiresAt');

              this.router.navigate([routes.resetPassword], {
                state: {
                  mobileNo: this.verifyOtpForm.value.mobileNo
                }
              });

              console.log("Enter 1 : "+response.payload.respCode+ " , "+ response.payload.respMesg);
              console.log("Enter 2 : "+response['payload']['respMesg']+" , "+response['payload']['respMesg'])

              // this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover'
              });
            } else {

              console.log("Enter 3 : "+response.payload.respCode+ " , "+ response.payload.respMesg);
              console.log("Enter 4 : "+response['payload']['respMesg']+" , "+response['payload']['respMesg'])


              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover'
              });
            }
          } else {
            this.messageService.add({
              summary: response.responseCode,
              detail: response.responseMesg,
              styleClass: 'danger-background-popover'
            });
          }
        },
        error: () => {

          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
            styleClass: 'danger-background-popover'
          });
        }
      });
  }


  startCountdown(): void {
    this.stopCountdown();
    this.otpExpiresAt = this.authenticationService.getOtpExpiry() ?? Date.now();
    this.updateCountdown();

    if (this.totalSeconds > 0) {
      this.timer = setInterval(() => this.updateCountdown(), 1000);
    }
  }

  private updateCountdown(): void {
    this.totalSeconds = Math.max(0, Math.ceil((this.otpExpiresAt - Date.now()) / 1000));
    const minutes = Math.floor(this.totalSeconds / 60);
    const seconds = this.totalSeconds % 60;
    this.displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (this.totalSeconds === 0) {
      this.stopCountdown();
    }
  }

  private stopCountdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  resendOtp(){
    const mobileNo = this.verifyOtpForm.value.mobileNo
      || this.authenticationService.getResetMobileNo();

    if (!mobileNo || this.isResending) {
      return;
    }

    this.isResending = true;
    this.userManagementService.sendOtp({ mobileNo, requestedFor: 'RESET_PASS' })
      .subscribe({
        next: (response: any) => {
          this.isResending = false;

          if (response?.responseCode === 200 && response?.payload?.respCode === 200) {
            this.authenticationService.setOtpExpiry();
            this.verifyOtpForm.patchValue({ otp: '' });
            document.querySelectorAll<HTMLInputElement>('.forms-block input')
              .forEach(input => input.value = '');
            this.startCountdown();

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.payload.respMesg || 'OTP resent successfully.'
            });
            return;
          }

          this.messageService.add({
            summary: response?.payload?.respCode ?? response?.responseCode ?? 'Error',
            detail: response?.payload?.respMesg ?? response?.responseMesg ?? 'Unable to resend OTP.',
            styleClass: 'danger-background-popover'
          });
        },
        error: () => {
          this.isResending = false;
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
            styleClass: 'danger-background-popover'
          });
        }
      });
  }

}

    
    

