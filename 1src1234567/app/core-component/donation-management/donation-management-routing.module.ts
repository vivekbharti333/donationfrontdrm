import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DonationManagementComponent } from './donation-management.component';
import { AddDonationComponent } from './add-donation/add-donation.component'; 
import { AllDonationListComponent } from './all-donation-list/all-donation-list.component'; 


const routes: Routes = [
  {
    path: '',
    component: DonationManagementComponent,
    children: [
      {
        path: 'add-donation',
        component: AddDonationComponent,
      },
      {
        path: 'all-donation-list',
        component: AllDonationListComponent,
      },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DonationManagementRoutingModule { }
