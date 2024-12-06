import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { CurrencyManagementComponent } from './currency-management.component'; 
import { CurrencyMasterComponent } from './currency-master/currency-master.component'; 
import { CurrencyComponent } from './currency/currency.component';
import { CurrencyManagementRoutingModule } from './currency-management-routing.module'; 

import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    CurrencyManagementComponent,
    CurrencyMasterComponent,
    CurrencyComponent,
  ],
  imports: [
    CurrencyManagementRoutingModule,
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule
  ]
})
export class CurrencyManagementModule { }
