import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';

@Component({
  selector: 'app-error-404',
  templateUrl: './error-404.component.html',
  styleUrl: './error-404.component.scss'
})
export class Error404Component {
  public routes = routes;
  constructor(private router: Router) { }

  backToDashboard() {
    this.router.navigate([routes.baseUrl]);
  }
}
