import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WhatsAppManagementRoutingModule } from './whats-app-management-routing.module';
import { WhatsAppManagementComponent } from './whats-app-management.component';
import { WhatsAppInboxComponent } from './whats-app-inbox/whats-app-inbox.component';
import { WhatsAppTemplatesComponent } from './whats-app-templates/whats-app-templates.component';
import { AddWhatsAppTemplatesComponent } from './add-whats-app-templates/add-whats-app-templates.component';
import { sharedModule } from 'src/app/shared/shared.module';

import { NgxEditorModule } from 'ngx-editor';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    WhatsAppManagementComponent,
    WhatsAppInboxComponent ,
    WhatsAppTemplatesComponent,
    AddWhatsAppTemplatesComponent,
  ],
  imports: [
    CommonModule,
    WhatsAppManagementRoutingModule,
    sharedModule,
    NgxEditorModule,
    MatDialogModule
  ]
})
export class WhatsAppManagementModule { }
