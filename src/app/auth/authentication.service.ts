import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { routes } from '../core/core.index';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public loginUser: any;

  public details = false;

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) {
    this.loginUser = this.getLoginUser();
  }

  getLoginUser() {
    let details = this.cookieService.get('loginDetails');
    if (details) {
      return JSON.parse(details);
    } else {
      return;
    }
  }


  logOut() {
    this.cookieService.delete('loginDetails');
    this.cookieService.deleteAll();
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate([routes.signIn]);
  }

}
