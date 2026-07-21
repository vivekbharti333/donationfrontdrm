import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { AuthenticationService } from '../../authenticationService/authentication.service';
@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent {

  public routes = routes;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  goToLogin() {
    this.authenticationService.clearResetFlow();
    this.router.navigate([routes.signIn]);
  }

}