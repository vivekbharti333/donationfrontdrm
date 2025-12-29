import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { sharedModule } from 'src/app/shared/shared.module';
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component';
import { UsersComponent } from './users/users.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { CreateUserComponent } from './create-user/create-user.component';


@NgModule({
  declarations: [
    UserManagementComponent,
    DeleteAccountComponent,
    RolesPermissionsComponent,
    UsersComponent,
    PermissionsComponent,
    CreateUserComponent,
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserManagementModule { }
