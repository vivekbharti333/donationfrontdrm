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
  private timer: any;
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
    this.startCountdown();

    const mobileNo = history.state.mobileNo;
    if (mobileNo) {
      this.verifyOtpForm.patchValue({
        mobileNo: mobileNo
      });
    }
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
    this.timer = setInterval(() => {
      const minutes = Math.floor(this.totalSeconds / 60);
      const seconds = this.totalSeconds % 60;

      this.displayTime =
        String(minutes).padStart(2, '0') +
        ':' +
        String(seconds).padStart(2, '0');

      if (this.totalSeconds <= 0) {
        clearInterval(this.timer);

        this.displayTime = '00:00';

        // OTP Expired
        // Enable Resend OTP button here if required
      } else {
        this.totalSeconds--;
      }

    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  resendOtp(){

  }

}

    
    

