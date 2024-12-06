import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { CreateLeadComponent } from './create-lead/create-lead/create-lead.component';
import { LeadManagementComponent } from './lead-management.component';
import { LeadManagementRoutingModule } from './lead-management-routing.module';
import { FollowupOneComponent } from './followup-list/followup-one/followup-one.component';
import { FollowupTwoComponent } from './followup-list/followup-two/followup-two.component';
import { FollowupThreeComponent } from './followup-list/followup-three/followup-three.component';
import { AllLeadComponent } from './lead-list/all-lead/all-lead.component';
import { LostComponent } from './lead-list/lost/lost.component';
import { ReservedComponent } from './lead-list/reserved/reserved.component';
import { EnquiryComponent } from './lead-list/enquiry/enquiry.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { InfoComponent } from './lead-list/info/info.component';
import { HotLeadComponent } from './lead-list/hot-lead/hot-lead.component';
import { ImportaintLeadComponent } from './lead-list/importaint-lead/importaint-lead.component';
import { PendingPaymentComponent } from './lead-list/pending-payment/pending-payment.component';
import { WonComponent } from './lead-list/won/won.component';
import { AssignedLeadComponent } from './lead-list/assigned-lead/assigned-lead.component';
import { FollowupLeadComponent } from './lead-list/followup-lead/followup-lead.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [
    LeadManagementComponent,
    CreateLeadComponent,
    FollowupOneComponent,
    FollowupTwoComponent,
    FollowupThreeComponent,
    AllLeadComponent,
    LostComponent,
    ReservedComponent,
    EnquiryComponent,
    InfoComponent,
    HotLeadComponent,
    ImportaintLeadComponent,
    PendingPaymentComponent,
    WonComponent,
    AssignedLeadComponent,
    FollowupLeadComponent,
  ],
  imports: [
    LeadManagementRoutingModule,
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    CalendarModule
  ]
})
export class LeadManagementModule { }
