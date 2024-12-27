import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../core/helpers/routes';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root',
})
export class WebstorgeService {

  constructor(
    private router: Router,
    private cookieService: CookieService,
  ) {}

  public login(): void {
    localStorage.setItem('authenticated', 'true');
    this.router.navigate([routes.dashboard]);
  }
  public submit(): void {
    localStorage.setItem('authenticated', 'true');
    this.router.navigate([routes.dashboard]);
  }
  public Logout(): void {
    localStorage.removeItem('authorized');
    localStorage.removeItem('loginTime');
    this.cookieService.deleteAll();
    this.router.navigate(['/auth/signin']);
  }
}
