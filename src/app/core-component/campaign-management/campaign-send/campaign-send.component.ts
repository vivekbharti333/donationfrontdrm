import { Component, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CampaignSendService } from './campaign-send.service'; 
import { Constant } from 'src/app/core/constant/constants';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-campaign-send',
  templateUrl: './campaign-send.component.html',
  styleUrl: './campaign-send.component.scss',
  providers: [MessageService, ToastModule],
})
export class CampaignSendComponent {

  public campaignDetailsList:any=[];
    public sendCompaignForm!: FormGroup;

  constructor(
      private data: DataService,
      private pagination: PaginationService,
      private router: Router,
      private sidebar: SidebarService,
      private messageService: MessageService,
      private campaignSendService: CampaignSendService,
      private dialog: MatDialog,
       private fb: FormBuilder,
    ) {}
  
      ngOnInit() {
      this.getCampaignDetails();
      this.createForms();
    }

    createForms() {
        this.sendCompaignForm = this.fb.group({
          campaignId: [''],
          campaignChannel: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
    
        });
      }

   public getCampaignDetails() {
    this.campaignSendService.getCampaignDetails().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.campaignDetailsList = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

  public sendCompaign() {
  this.campaignSendService.sendCompaign(this.sendCompaignForm.value).subscribe({
    next: (response: any) => {
      if (response.responseCode === 200) {
        if (response.payload.respCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.payload.respMesg
          });

          this.sendCompaignForm.reset();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.payload.respMesg
          });
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: response.responseMessage
        });
      }
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Server error occurred'
      });
    }
  });
}

  // public sendCompaign() {
  //   this.campaignSendService.sendCompaign(this.sendCompaignForm.value)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response['responseCode'] == 200) {
  //           let payload = response['payload'];
  //           if (response['payload']['respCode'] == 200) {
  //             this.messageService.add({ severity: 'success', summary: 'Success', detail: response['payload']['respMesg'] });

  //             this.sendCompaignForm.reset();
             
  //           } else {
  //             this.messageService.add({
  //               summary: response['payload']['respCode'],
  //               detail: response['payload']['respMesg'],
  //               styleClass: 'danger-light-popover',
  //             });
  //           }
  //         } else {
  //           this.messageService.add({
  //             summary: response['responseCode'],
  //             detail: response['responseMessage'],
  //             styleClass: 'danger-light-popover',
  //           });
  //         }

  //         // this.messageService.add({
  //         //   summary: 'Toast',
  //         //   detail: 'Your,toast message here.',
  //         //   styleClass: 'danger-light-popover',
  //         // });
  //       },
  //       //error: (error: any) => this.toastr.error('Server Error', '500'),
  //     });
  // }


}
