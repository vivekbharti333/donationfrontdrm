import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { PaymentGatewayManagementComponent } from './payment-gateway-management.component';  
import { PaymentGatewayManagementRoutingModule } from './payment-gateway-management-routing.module'; 
import { CashfreeComponent } from './response/cashfree/cashfree.component'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    PaymentGatewayManagementComponent,
    CashfreeComponent,
  ],
  imports: [
    PaymentGatewayManagementRoutingModule,
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
    
  ], providers: [MessageService],
})
export class PaymentGatewayManagementModule { }
