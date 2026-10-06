import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { CommonManagementRoutingModule } from './common-management-routing.module';
import { UsesLimitComponent } from './uses-limit/uses-limit.component';

import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    UsesLimitComponent
  ],
  imports: [
    CommonModule,
    CommonManagementRoutingModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule
  ]
})
export class CommonManagementModule { }
