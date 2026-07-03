import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CampaignManagementComponent } from './campaign-management.component';
import { CampaignDetailsComponent } from './campaign-details/campaign-details.component'; 
import { CampaignReportComponent } from './campaign-report/campaign-report.component';
import { CampaignSendComponent } from './campaign-send/campaign-send.component';

import { AuthGuard } from 'src/app/core/core.index';

const routes: Routes = [
  {
    path: '',
    component: CampaignManagementComponent,
    children: [
      {
        path: 'campaign-details',
        component: CampaignDetailsComponent,
      },
      {
        path: 'send-campaign',
        component: CampaignSendComponent,
      },
      {
        path: 'campaign-report',
        component: CampaignReportComponent,
      },
      
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignManagementRoutingModule { }
