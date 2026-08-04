
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/auth/authenticationService/authentication.service';

export const otpGuard: CanActivateFn = () => {

  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  const hasActiveOtpFlow = authenticationService.isOtpSent()
    && !!authenticationService.getResetMobileNo()
    && authenticationService.getOtpExpiry() !== null;

  if (hasActiveOtpFlow) {
    return true;
  }

  return router.createUrlTree(['/forgot-password']);
};
