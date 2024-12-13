import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentModeManagementComponent } from './payment-mode-management.component'; 
import { PaymentModeMasterComponent } from './payment-mode-master/payment-mode-master.component'; 
import { PaymentModeComponent } from './payment-mode/payment-mode.component';


const routes: Routes = [
  {
    path: '',
    component: PaymentModeManagementComponent,
    children: [
      {
        path: 'payment-mode-master',
        component: PaymentModeMasterComponent,
      },
      {
        path: 'payment-mode',
        component: PaymentModeComponent,
      },
      
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentModeManagementRoutingModule { }
