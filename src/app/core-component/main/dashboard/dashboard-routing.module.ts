import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { CampaignDashboardComponent } from './campaign-dashboard/campaign-dashboard.component';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';
import { SchoolDashboardComponent } from './school-dashboard/school-dashboard.component';
import { DashboardPermissionGuard } from 'src/app/core/guard/auth/dashboard-permission.guard';

const routes: Routes = [{ path: '', component: DashboardComponent,
children: [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
    canActivate: [DashboardPermissionGuard],
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent, canActivate: [DashboardPermissionGuard]
  },
  {
    path: 'sales-dashboard',
    component: SalesDashboardComponent, canActivate: [DashboardPermissionGuard]
  },
  {
    path: 'campaign-dashboard',
    component: CampaignDashboardComponent, canActivate: [DashboardPermissionGuard]
  },
  {
    path: 'donation-dashboard',
    component: DonationDashboardComponent, canActivate: [DashboardPermissionGuard]
  },
  {
    path: 'school-dashboard',
    component: SchoolDashboardComponent,
    canActivate: [DashboardPermissionGuard]
  }
]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
