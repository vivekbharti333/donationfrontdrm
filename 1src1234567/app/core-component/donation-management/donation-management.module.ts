import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { DonationManagementComponent } from './donation-management.component'; 
import { AddDonationComponent } from './add-donation/add-donation.component'; 
import { AllDonationListComponent } from './all-donation-list/all-donation-list.component';
import { DonationManagementRoutingModule } from './donation-management-routing.module'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import {NgxPaginationModule} from 'ngx-pagination';


@NgModule({
  declarations: [
    DonationManagementComponent,
    AddDonationComponent,
    AllDonationListComponent
  ],
  imports: [
    DonationManagementRoutingModule,
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    CalendarModule,
    NgxPaginationModule
  ], providers: [MessageService],
})
export class DonationManagementModule { }
