import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentGatewayManagementComponent } from './payment-gateway-management.component';
import { CashfreeComponent } from './response/cashfree/cashfree.component';


const routes: Routes = [
  {
    path: '',
    component: PaymentGatewayManagementComponent,
    children: [
      {
        path: 'cashfree-response',
        component: CashfreeComponent,
      },
     
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentGatewayManagementRoutingModule { }
