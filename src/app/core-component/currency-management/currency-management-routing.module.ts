import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CurrencyManagementComponent } from './currency-management.component'; 
import { CurrencyMasterComponent } from './currency-master/currency-master.component'; 
import { CurrencyComponent } from './currency/currency.component';

const routes: Routes = [
  {
    path: '',
    component: CurrencyManagementComponent,
    children: [
      {
        path: 'currency-master',
        component: CurrencyMasterComponent,
      },
      {
        path: 'currency',
        component: CurrencyComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencyManagementRoutingModule { }
