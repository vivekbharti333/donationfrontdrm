import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { ToastModule } from 'primeng/toast';
import { CustomPaginationModule } from 'src/app/shared/custom-pagination/custom-pagination.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { SchoolManagementComponent } from './school-management.component'; 
import { SchoolManagementRoutingModule } from './school-management-routing.module';
import { AddStudentComponent } from './students/add-student/add-student.component';
import { StudentListComponent } from './students/student-list/student-list.component';
import { GenerateSchoolReceiptComponent } from './receipt/generate-school-receipt/generate-school-receipt.component';
import { SchoolReceiptListComponent } from './receipt/school-receipt-list/school-receipt-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CalendarModule } from 'primeng/calendar';
import { FeeTypeComponent } from './fees/fee-type/fee-type.component';
import { FeeStructureComponent } from './fees/fee-structure/fee-structure.component';
import { StudentAcademicComponent } from './academic/student-academic/student-academic.component';
import { GradeComponent } from './academic/grade/grade.component';
import { FeeAssignmentComponent } from './fees/fee-assignment/fee-assignment.component';

import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    SchoolManagementComponent,
    AddStudentComponent,
    StudentListComponent,
    GenerateSchoolReceiptComponent,
    SchoolReceiptListComponent,
    FeeTypeComponent,
    FeeStructureComponent,
    StudentAcademicComponent,
    GradeComponent,
    FeeAssignmentComponent
  ],
  imports: [
    SchoolManagementRoutingModule,
    CommonModule,
    sharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatSortModule,
    ToastModule,
    CustomPaginationModule,
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
