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
    this.createForms();
  }

  createForms() {
    this.sendOtpForm = this.fb.group({
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Assuming a 10-digit phone number
      requestedFor: ['RESET_PASS']
    });
  }


  sendOtp() {
    console.log("sendOtpForm : "+this.sendOtpForm.value.mobileNo)
    if (this.sendOtpForm.invalid) {
      this.sendOtpForm.markAllAsTouched();
      return;
    }
    this.userManagementService.sendOtp(this.sendOtpForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            if (response['payload']['respCode'] === 200) {

              this.authenticationService.setResetMobileNo(this.sendOtpForm.value.mobileNo);
              this.authenticationService.setOtpSent(true);


              this.router.navigate([routes.otpVerification], {
                state: {
                  mobileNo: this.sendOtpForm.value.mobileNo
                }
              });
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });
            } else {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['responseCode'],
              detail: response['payload']['responseMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: (error: any) => this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
      });
  }
}
