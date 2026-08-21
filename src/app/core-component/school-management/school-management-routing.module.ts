import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolManagementComponent } from './school-management.component';
import { AddStudentComponent } from './students/add-student/add-student.component';
import { StudentListComponent } from './students/student-list/student-list.component';
import { GenerateSchoolReceiptComponent } from './receipt/generate-school-receipt/generate-school-receipt.component';
import { SchoolReceiptListComponent } from './receipt/school-receipt-list/school-receipt-list.component';
import { FeeTypeComponent } from './fees/fee-type/fee-type.component';
import { FeeStructureComponent } from './fees/fee-structure/fee-structure.component';
import { StudentAcademicComponent } from './academic/student-academic/student-academic.component';
// Standalone fee assignment screen.
import { FeeAssignmentComponent } from './fees/fee-assignment/fee-assignment.component';
import { GradeComponent } from './academic/grade/grade.component';
 

const routes: Routes = [
  {
    path: '',
    component: SchoolManagementComponent,
    children: [
      {
        path: 'add-student',
        component: AddStudentComponent,
      },
      {
        path: 'student-list',
        component: StudentListComponent,
      },
       {
        path: 'generate-school-receipt',
        component: GenerateSchoolReceiptComponent,
      },
      {
        path: 'school-receipt-list',
        component: SchoolReceiptListComponent,
      },
      {
        path: 'fee-type',
        component: FeeTypeComponent,
      },
      {
        path: 'fee-structure',
        component: FeeStructureComponent,
      },
      {
        path: 'student-academic',
        component: StudentAcademicComponent,
      },
      {
        path: 'fee-assignment',
        component: FeeAssignmentComponent,
      },
      {
        path: 'grade',
        component: GradeComponent,
      },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolManagementRoutingModule { }
