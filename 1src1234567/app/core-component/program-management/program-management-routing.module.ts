import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgramManagementComponent } from './program-management.component'; 
import { ProgramComponent } from './program/program.component'; 


const routes: Routes = [
  {
    path: '',
    component: ProgramManagementComponent,
    children: [
      {
        path: 'program',
        component: ProgramComponent,
      },
     
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramManagementRoutingModule { }
