import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolManagementComponent } from './school-management.component';
import { AddStudentComponent } from './add-student/add-student.component'; 
import { StudentListComponent } from './student-list/student-list.component';
import { GenerateSchoolReceiptComponent } from './generate-school-receipt/generate-school-receipt.component';
import { SchoolReceiptListComponent } from './school-receipt-list/school-receipt-list.component';
 

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
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolManagementRoutingModule { }
