import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolManagementComponent } from './school-management.component';
import { AddStudentComponent } from './add-student/add-student.component'; 
import { StudentListComponent } from './student-list/student-list.component';
 

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
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolManagementRoutingModule { }
