import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { SchoolManagementComponent } from './school-management.component'; 
import { SchoolManagementRoutingModule } from './school-management-routing.module';
import { AddStudentComponent } from './add-student/add-student.component';
import { StudentListComponent } from './student-list/student-list.component';
import { GenerateSchoolReceiptComponent } from './generate-school-receipt/generate-school-receipt.component';
import { SchoolReceiptListComponent } from './school-receipt-list/school-receipt-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CalendarModule } from 'primeng/calendar';

import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    SchoolManagementComponent,
    AddStudentComponent,
    StudentListComponent,
    GenerateSchoolReceiptComponent,
    SchoolReceiptListComponent
  ],
  imports: [
    SchoolManagementRoutingModule,
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
export class SchoolManagementModule { }
