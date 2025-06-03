// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-payment-gateway-details',
//   standalone: true,
//   imports: [],
//   templateUrl: './payment-gateway-details.component.html',
//   styleUrl: './payment-gateway-details.component.scss'
// })
// export class PaymentGatewayDetailsComponent {

// }


import { Component } from '@angular/core';
import { routes } from 'src/app/core/helpers/routes';
import { SidebarService } from 'src/app/core/service/sidebar/sidebar.service';

@Component({
  selector: 'app-payment-gateway-settings',
  templateUrl: './payment-gateway-settings.component.html',
  styleUrl: './payment-gateway-settings.component.scss',
})
export class PaymentGatewayDetailsComponent {
  public routes = routes;
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  constructor(private sidebar: SidebarService) {}
}
