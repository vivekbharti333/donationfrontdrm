import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadManagementComponent } from './lead-management.component';
import { CreateLeadComponent } from './create-lead/create-lead/create-lead.component';
import { FollowupOneComponent } from './followup-list/followup-one/followup-one.component';
import { AllLeadComponent } from './lead-list/all-lead/all-lead.component';
import { EnquiryComponent } from './lead-list/enquiry/enquiry.component';
import { ReservedComponent } from './lead-list/reserved/reserved.component';
import { LostComponent } from './lead-list/lost/lost.component';
import { InfoComponent } from './lead-list/info/info.component';
import { HotLeadComponent } from './lead-list/hot-lead/hot-lead.component';
import { FollowupLeadComponent } from './lead-list/followup-lead/followup-lead.component';
import { ImportaintLeadComponent } from './lead-list/importaint-lead/importaint-lead.component';
import { PendingPaymentComponent } from './lead-list/pending-payment/pending-payment.component';
import { WonComponent } from './lead-list/won/won.component';
import { AssignedLeadComponent } from './lead-list/assigned-lead/assigned-lead.component';

const routes: Routes = [
  {
    path: '',
    component: LeadManagementComponent,
    children: [
      {
        path: 'create-lead',
        component: CreateLeadComponent,
      },
      {
        path: 'info',
        component: InfoComponent,
      },
      {
        path: 'enquiry',
        component: EnquiryComponent,
      },
      {
        path: 'hot-lead',
        component: HotLeadComponent,
      },
      {
        path: 'followup-lead',
        component: FollowupLeadComponent,
      },
      {
        path: 'importaint-lead',
        component: ImportaintLeadComponent,
      },
      {
        path: 'pending-payment',
        component: PendingPaymentComponent,
      },
      {
        path: 'won-lead',
        component: WonComponent,
      },
      {
        path: 'lost-lead',
        component: LostComponent,
      },
      {
        path: 'assigned-lead',
        component: AssignedLeadComponent,
      },
      {
        path: 'follow-up-one',
        component: FollowupOneComponent,
      },
      {
        path: 'all-lead',
        component: AllLeadComponent,
      },
      {
        path: 'reserved',
        component: ReservedComponent,
      },
     
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadManagementRoutingModule { }
