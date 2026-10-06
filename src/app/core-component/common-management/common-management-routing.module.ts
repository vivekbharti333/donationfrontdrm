import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { UsesLimitComponent } from './uses-limit/uses-limit.component';

const routes: Routes = [
  { path: 'uses-limit', component: UsesLimitComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonManagementRoutingModule { }
