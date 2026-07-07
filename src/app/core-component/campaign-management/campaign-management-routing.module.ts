import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { CampaignManagementComponent } from './campaign-management.component';
import { CampaignDetailsComponent } from './campaign-details/campaign-details.component'; 
import { CampaignReportComponent } from './campaign-report/campaign-report.component';
import { CampaignSendComponent } from './campaign-send/campaign-send.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';

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
      {
        path: 'contact-details',
        component: ContactDetailsComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignManagementRoutingModule { }
