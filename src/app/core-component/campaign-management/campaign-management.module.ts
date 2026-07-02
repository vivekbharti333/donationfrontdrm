import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { CampaignManagementComponent } from './campaign-management.component';
import { CampaignDetailsComponent } from './campaign-details/campaign-details.component';
import { CampaignReportComponent } from './campaign-report/campaign-report.component';
import { CampaignManagementRoutingModule } from './campaign-management-routing.module';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    CampaignManagementComponent,
    CampaignDetailsComponent,
    CampaignReportComponent
  ],
  imports: [
    CommonModule,
    CampaignManagementRoutingModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule
  ]
})
export class CampaignManagementModule { }
