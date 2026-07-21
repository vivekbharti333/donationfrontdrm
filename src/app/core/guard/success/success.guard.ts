import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/auth/authenticationService/authentication.service';

export const successGuard: CanActivateFn = () => {

  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  if (authenticationService.isPasswordReset()) {
    return true;
  }

  return router.createUrlTree(['/sign-in']);
};