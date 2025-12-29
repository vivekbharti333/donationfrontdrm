import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { AuthGuard } from 'src/app/core/core.index';

const routes: Routes = [{ path: '', component: DashboardComponent,
children: [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin-dashboard',  
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent, canActivate: [AuthGuard]
  },
  {
    path: 'sales-dashboard',
    component: SalesDashboardComponent, canActivate: [AuthGuard]
  }
]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
