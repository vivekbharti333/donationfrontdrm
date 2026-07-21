import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MessageService } from 'primeng/api';

import { routes } from 'src/app/core/helpers/routes';
import { UserManagementService } from
  'src/app/core-component/user-management/user-management.service';
  import { AuthenticationService } from '../../authenticationService/authentication.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [MessageService]
})
export class ResetPasswordComponent implements OnInit {

  public routes = routes;

  // Index 0 = password, index 1 = confirm password
  public passwordVisible: boolean[] = [false, false];

  public changePasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userManagementService: UserManagementService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.createForm();

    const mobileNo = history.state.mobileNo;

    if (mobileNo) {
      this.changePasswordForm.patchValue({
        loginId: mobileNo
      });
    }
  }

  createForm(): void {
    this.changePasswordForm = this.fb.group(
      {
        loginId: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6)
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ]
      },
      {
        validators: this.passwordMatchValidator()
      }
    );
  }

  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword
        ? null
        : { passwordMismatch: true };
    };
  }

  togglePassword(index: number): void {
    this.passwordVisible[index] = !this.passwordVisible[index];
  }

  changeUserPasswordDirect(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();

      if (this.changePasswordForm.hasError('passwordMismatch')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Password Mismatch',
          detail: 'Password and confirm password do not match.',
          styleClass: 'danger-background-popover'
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Form',
          detail: 'Please enter all required fields correctly.',
          styleClass: 'danger-background-popover'
        });
      }

      return;
    }

    const requestData = {
      loginId: this.changePasswordForm.value.loginId,
      password: this.changePasswordForm.value.password,
      confirmPassword: this.changePasswordForm.value.confirmPassword
    };

    this.userManagementService
      .changeUserPasswordDirect(requestData)
      .subscribe({
        next: (response: any) => {
          if (
            response?.responseCode === 200 &&
            response?.payload?.respCode === 200
          ) {

            this.authenticationService.setPasswordReset(true);

            this.router.navigate([routes.success]);

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail:
                response?.payload?.respMesg ||
                'Password changed successfully.'
            });

            this.router.navigate([routes.success]);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: String(
                response?.payload?.respCode ||
                response?.responseCode ||
                'Error'
              ),
              detail:
                response?.payload?.respMesg ||
                response?.responseMesg ||
                'Unable to change password.',
              styleClass: 'danger-background-popover'
            });
          }
        },

        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: '500',
            detail:
              error?.error?.responseMesg ||
              error?.error?.message ||
              'Server Error',
            styleClass: 'danger-background-popover'
          });
        }
      });
  }

  get passwordControl(): AbstractControl | null {
    return this.changePasswordForm.get('password');
  }

  get confirmPasswordControl(): AbstractControl | null {
    return this.changePasswordForm.get('confirmPassword');
  }
}