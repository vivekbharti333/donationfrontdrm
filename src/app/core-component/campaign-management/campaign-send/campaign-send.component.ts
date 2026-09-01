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
import { ContactDetailsService } from '../contact-details/contact-details.service';

@Component({
  selector: 'app-campaign-send',
  templateUrl: './campaign-send.component.html',
  styleUrl: './campaign-send.component.scss',
  providers: [MessageService, ToastModule],
})
export class CampaignSendComponent {

  public campaignDetailsList:any=[];
  public whatsAppTemplates: any[] = [];
  public selectedWhatsAppTemplate: any = null;
  public isWhatsAppTemplatesLoading = false;
  public whatsAppTemplatesError = '';
  public recipientMode: 'ALL' | 'SELECTED' = 'ALL';
  public contacts: any[] = [];
  public selectedContactIds = new Set<any>();
  public contactSearch = '';
  public isContactsLoading = false;
  public selectedChannelFilter: 'ALL' | 'EMAIL' | 'WHATSAPP' | 'SMS' = 'ALL';
    public sendCompaignForm!: FormGroup;

  constructor(
      private data: DataService,
      private pagination: PaginationService,
      private router: Router,
      private sidebar: SidebarService,
      private messageService: MessageService,
      private campaignSendService: CampaignSendService,
      private dialog: MatDialog,
      private contactDetailsService: ContactDetailsService,
       private fb: FormBuilder,
    ) {}
  
      ngOnInit() {
      this.getCampaignDetails();
      this.getContacts();
      this.createForms();
    }

    createForms() {
        this.sendCompaignForm = this.fb.group({
          campaignId: ['', Validators.required],
          campaignChannel: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
    
        });
      }

    public selectChannel(channel: 'ALL' | 'EMAIL' | 'WHATSAPP' | 'SMS'): void {
      this.selectedChannelFilter = channel;
      this.sendCompaignForm.patchValue({
        campaignChannel: channel === 'ALL' ? '' : channel,
        campaignId: '',
      });
      this.selectedWhatsAppTemplate = null;

      if (channel === 'WHATSAPP') {
        this.getWhatsAppTemplates();
        this.getContacts();
      }
    }

    public selectCampaign(campaignId: any): void {
      const campaign = this.campaignDetailsList.find((item: any) => String(item.id) === String(campaignId));
      this.sendCompaignForm.patchValue({
        campaignId,
        campaignChannel: campaign?.campaignChannel || this.sendCompaignForm.get('campaignChannel')?.value,
      });

      if (campaign?.campaignChannel?.toUpperCase() === 'WHATSAPP') {
        this.selectedChannelFilter = 'WHATSAPP';
        this.getWhatsAppTemplates();
      }
    }

    public getWhatsAppTemplates(): void {
      this.isWhatsAppTemplatesLoading = true;
      this.whatsAppTemplatesError = '';
      this.whatsAppTemplates = [];

      this.campaignSendService.getWhatsAppTemplate().subscribe({
        next: (response: any) => {
          this.isWhatsAppTemplatesLoading = false;
          if (Number(response?.responseCode) === 200) {
            this.whatsAppTemplates = Array.isArray(response?.listPayload) ? response.listPayload : [];
          } else {
            this.whatsAppTemplatesError = response?.responseMessage || 'Could not load WhatsApp templates.';
          }
        },
        error: () => {
          this.isWhatsAppTemplatesLoading = false;
          this.whatsAppTemplatesError = 'Could not load WhatsApp templates. Please try again.';
        },
      });
    }

    public selectWhatsAppTemplate(template: any): void {
      this.selectedWhatsAppTemplate = template;
    }

    public get eligibleContacts(): any[] {
      return this.contacts.filter(contact => !!(contact?.mobileNumber || contact?.whatsAppNumber || contact?.phoneNumber));
    }

    public get filteredContacts(): any[] {
      const term = this.contactSearch.trim().toLowerCase();
      return !term ? this.eligibleContacts : this.eligibleContacts.filter(contact =>
        [contact.contactName, contact.mobileNumber, contact.emailId, contact.companyName]
          .some(value => String(value || '').toLowerCase().includes(term)),
      );
    }

    public get recipientCount(): number {
      return this.recipientMode === 'ALL' ? this.eligibleContacts.length : this.selectedContactIds.size;
    }

    public setRecipientMode(mode: 'ALL' | 'SELECTED'): void {
      this.recipientMode = mode;
    }

    public toggleContact(contactId: any, checked: boolean): void {
      if (checked) this.selectedContactIds.add(contactId);
      else this.selectedContactIds.delete(contactId);
      this.selectedContactIds = new Set(this.selectedContactIds);
    }

    public changeContactSelection(contactId: any, checked: boolean): void {
      if (this.recipientMode === 'ALL') {
        this.selectedContactIds = new Set(this.eligibleContacts.map(contact => contact.id));
        this.recipientMode = 'SELECTED';
      }
      this.toggleContact(contactId, checked);
    }

    public get areAllEligibleContactsSelected(): boolean {
      return this.eligibleContacts.length > 0 && this.eligibleContacts.every(contact => this.selectedContactIds.has(contact.id));
    }

    public toggleAllEligibleContacts(checked: boolean): void {
      this.recipientMode = 'SELECTED';
      this.selectedContactIds = checked
        ? new Set(this.eligibleContacts.map(contact => contact.id))
        : new Set();
    }

    private getContacts(): void {
      if (this.contacts.length || this.isContactsLoading) return;
      this.isContactsLoading = true;
      this.contactDetailsService.getContactDetails().subscribe({
        next: response => {
          this.contacts = Array.isArray(response?.listPayload) ? response.listPayload : [];
          this.isContactsLoading = false;
        },
        error: () => this.isContactsLoading = false,
      });
    }

    public get selectedCampaign(): any {
      const campaignId = this.sendCompaignForm?.get('campaignId')?.value;
      return this.campaignDetailsList.find((campaign: any) => String(campaign.id) === String(campaignId));
    }

    public get visibleCampaigns(): any[] {
      if (this.selectedChannelFilter === 'ALL') return this.campaignDetailsList;
      return this.campaignDetailsList.filter((campaign: any) =>
        campaign?.campaignChannel?.toUpperCase() === this.selectedChannelFilter,
      );
    }

    public get channelSelectionMessage(): string {
      if (this.selectedChannelFilter === 'WHATSAPP') {
        const count = this.whatsAppTemplates.length;
        return `Showing ${count} ${count === 1 ? 'template' : 'templates'} for WhatsApp.`;
      }

      const channelName = this.selectedChannelFilter === 'ALL'
        ? 'all channels'
        : this.selectedChannelFilter === 'SMS'
            ? 'SMS'
            : 'Email';
      const count = this.visibleCampaigns.length;
      return `Showing ${count} ${count === 1 ? 'campaign' : 'campaigns'} for ${channelName}.`;
    }

    public toPlainText(value: string | undefined): string {
      if (!value) return '';
      const textArea = document.createElement('textarea');
      textArea.innerHTML = value.replace(/<[^>]*>/g, ' ');
      return textArea.value.replace(/\s+/g, ' ').trim();
    }

    public slideCampaignList(list: HTMLElement, direction = 1): void {
      list.scrollBy({ left: direction * Math.min(list.clientWidth * 0.8, 320), behavior: 'smooth' });
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
  if (this.selectedChannelFilter === 'WHATSAPP' && (!this.selectedWhatsAppTemplate || this.recipientCount === 0)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Recipients or template required',
      detail: 'Select a WhatsApp template and at least one recipient before sending the campaign.',
    });
    return;
  }

  const selectedContactIds = Array.from(this.selectedContactIds);
  const campaignRequest = {
    ...this.sendCompaignForm.value,
    campaignName: this.selectedCampaign?.campaignName || '',
    templateId: this.selectedWhatsAppTemplate?.templateId || null,
    campaignType: this.selectedWhatsAppTemplate?.category || this.selectedCampaign?.campaignType || 'MARKETING',
    recipientMode: this.recipientMode,
    contactIds: this.recipientMode === 'ALL' ? [] : selectedContactIds,
    campaignTo: this.recipientMode === 'ALL' ? 'ALL_ELIGIBLE_CONTACTS' : `${selectedContactIds.length} selected contacts`,
    description: this.selectedWhatsAppTemplate
      ? this.selectedWhatsAppTemplate.msgBodyText || this.selectedWhatsAppTemplate.message || this.selectedWhatsAppTemplate.body || ''
      : this.selectedCampaign?.campaignDescription || this.selectedCampaign?.description || '',
  };

  this.campaignSendService.sendCompaign(campaignRequest).subscribe({
    next: (response: any) => {
      if (response.responseCode === 200) {
        if (response.payload.respCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.payload.respMesg
          });

          this.sendCompaignForm.reset();
          this.selectedWhatsAppTemplate = null;
          this.selectedContactIds = new Set();
          this.recipientMode = 'ALL';
          this.selectedChannelFilter = 'ALL';
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
