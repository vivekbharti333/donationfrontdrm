import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { ProgramManagementComponent } from './program-management.component'; 
import { ProgramManagementRoutingModule } from './program-management-routing.module';
import { ProgramComponent } from './program/program.component';  
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  declarations: [
    ProgramManagementComponent,
    ProgramComponent,
  ],
  imports: [
    ProgramManagementRoutingModule,
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
export class ProgramManagementModule { }
