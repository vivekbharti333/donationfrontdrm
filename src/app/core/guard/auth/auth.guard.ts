import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
      let isLoggedIn = this.authenticationService.getLoginUser();
      
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['/auth/signin']);
      return false;
    }
  }



  // @Injectable({
  //   providedIn: 'root', // Make it globally available
  // })
  // export class AuthGuard implements CanActivate {
  //   constructor(
  //     private router: Router,
  //     private authenticationService: AuthenticationService
  //   ) {}
  
  //   canActivate(): boolean {
  //     const isLoggedIn = this.authenticationService.getLoginUser();
  
  //     if (isLoggedIn) {
  //       return true;
  //     }
  
  //     this.router.navigate(['signin']);
  //     return false;
  //   }

}
