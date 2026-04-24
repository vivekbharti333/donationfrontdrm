import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhatsAppManagementComponent } from './whats-app-management.component';
import { WhatsAppInboxComponent } from './whats-app-inbox/whats-app-inbox.component';
import { WhatsAppTemplatesComponent } from './whats-app-templates/whats-app-templates.component';
import { AddWhatsAppTemplatesComponent } from './add-whats-app-templates/add-whats-app-templates.component';


const routes: Routes = [
  {
    path: '',
    component: WhatsAppManagementComponent,
    children: [
      { path: 'whats-app-inbox', component: WhatsAppInboxComponent },
      { path: 'whats-app-templates', component: WhatsAppTemplatesComponent }, 
      { path: 'add-whats-app-templates', component: AddWhatsAppTemplatesComponent }, 
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhatsAppManagementRoutingModule { }
