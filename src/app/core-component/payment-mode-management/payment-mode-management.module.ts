import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { PaymentModeManagementComponent } from './payment-mode-management.component'; 
import { PaymentModeMasterComponent } from './payment-mode-master/payment-mode-master.component';  
import { PaymentModeComponent } from './payment-mode/payment-mode.component'; 
import { PaymentModeManagementRoutingModule } from './payment-mode-management-routing.module'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  declarations: [
    PaymentModeManagementComponent,
    PaymentModeMasterComponent,
    PaymentModeComponent
  ],
  imports: [
    PaymentModeManagementRoutingModule,
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
export class PaymentModeManagementModule { }
