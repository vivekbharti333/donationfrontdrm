import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolManagementComponent } from './school-management.component';
import { AddStudentComponent } from './add-student/add-student.component'; 
import { StudentListComponent } from './student-list/student-list.component';
import { GenerateSchoolReceiptComponent } from './generate-school-receipt/generate-school-receipt.component';
import { SchoolReceiptListComponent } from './school-receipt-list/school-receipt-list.component';
import { FeeTypeComponent } from './fee-type/fee-type.component';
import { FeeStructureComponent } from './fee-structure/fee-structure.component';
import { StudentAcademicComponent } from './student-academic/student-academic.component';
 

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
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolManagementRoutingModule { }
