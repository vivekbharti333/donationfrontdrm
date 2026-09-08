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
import { AudienceService } from './audience.service';

@Component({
  selector: 'app-campaign-send',
  templateUrl: './campaign-send.component.html',
  styleUrl: './campaign-send.component.scss',
  providers: [MessageService, ToastModule],
})
export class CampaignSendComponent {
  public audiences: any[] = [];
  public audienceId: number | null = null;
  public audienceError = '';
  public isSending = false;
  public skipPreviouslySent = true;
  public recipientLogs: any[] = [];
  public isHistoryLoading = false;
  public historyError = '';

  private contactLoadId = 0;
  private historyLoadId = 0;
  public get selectedAudience(): any { return this.audiences.find(a => Number(a.id) === Number(this.audienceId)); }
  public loadAudiences(): void {
    this.audienceError = '';
    this.audienceService.list().subscribe({ next: r => {
      if ([200, 204].includes(Number(r.responseCode))) this.audiences = r.listPayload || [];
      else this.audienceError = r.responseMessage || 'Could not load audiences';
    }, error: () => this.audienceError = 'Could not load audiences. Please try again.' });
  }
  public selectAudience(value: any): void {
    this.audienceId = value ? Number(value) : null;
    this.contacts = []; this.selectedContactIds = new Set(); this.recipientMode = 'ALL';
    this.contactSearch = '';
    this.getContacts();
  }
  public loadRecipientLogs(): void {
    const requestId = ++this.historyLoadId;
    this.recipientLogs = []; this.historyError = '';
    const id = this.sendCompaignForm.get('campaignId')?.value;
    this.isHistoryLoading = !!id;
    if (!id) return;
    this.audienceService.logs(Number(id)).subscribe({ next: r => {
      if (requestId !== this.historyLoadId) return;
      this.isHistoryLoading = false;
      if ([200, 204].includes(Number(r.responseCode))) this.recipientLogs = r.listPayload || [];
      else this.historyError = r.responseMessage || 'Could not load campaign history';
    }, error: () => { if (requestId !== this.historyLoadId) return; this.isHistoryLoading = false; this.historyError = 'Could not load campaign history. Retry before sending.'; } });
  }
  public get selectedRecipients(): any[] {
    return this.recipientMode === 'ALL' ? this.eligibleContacts : this.eligibleContacts.filter(c => this.selectedContactIds.has(c.id));
  }

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
  public isCampaignDropdownOpen = false;
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
      private audienceService: AudienceService,
       private fb: FormBuilder,
    ) {}
  
      ngOnInit() {
      this.createForms();
      this.getCampaignDetails();
      this.getContacts();
      this.loadAudiences();
    }

    createForms() {
        this.sendCompaignForm = this.fb.group({
          campaignId: ['', Validators.required],
          campaignChannel: ['', [Validators.required, Validators.pattern("[0-9A-Za-z ]{3,150}")]],
    
        });
      }

    public get currentCampaignStep(): number {
      if (!this.selectedChannelFilter || this.selectedChannelFilter === 'ALL') return 1;
      if (!this.sendCompaignForm?.get('campaignId')?.value) return 2;
      return 3;
    }

    public selectChannel(channel: 'ALL' | 'EMAIL' | 'WHATSAPP' | 'SMS'): void {
      if (!this.selectedCampaign || channel !== String(this.selectedCampaign.campaignChannel).toUpperCase()) return;
      if (this.selectedChannelFilter === channel) return;
      this.selectedChannelFilter = channel;
      this.isCampaignDropdownOpen = false;
      this.sendCompaignForm.patchValue({
        campaignChannel: channel === 'ALL' ? '' : channel,
      });
      this.selectedWhatsAppTemplate = null;
      this.loadRecipientLogs();

      if (channel === 'WHATSAPP') {
        this.getWhatsAppTemplates();
        this.getContacts();
      }
    }

    public selectCampaign(campaignId: any): void {
      const campaign = this.campaignDetailsList.find((item: any) => String(item.id) === String(campaignId));
      this.selectedWhatsAppTemplate = null;
      this.selectedChannelFilter = campaign?.campaignChannel?.toUpperCase() || 'ALL';
      this.sendCompaignForm.patchValue({
        campaignId,
        campaignChannel: campaign?.campaignChannel || this.sendCompaignForm.get('campaignChannel')?.value,
      });

      if (campaign?.campaignChannel?.toUpperCase() === 'WHATSAPP') {
        this.selectedChannelFilter = 'WHATSAPP';
        this.getWhatsAppTemplates();
      }
      this.isCampaignDropdownOpen = false;
      this.loadRecipientLogs();
    }

    public toggleCampaignDropdown(): void {
      this.isCampaignDropdownOpen = !this.isCampaignDropdownOpen;
    }

    public isCampaignSelected(campaign: any): boolean {
      return String(campaign?.id) === String(this.sendCompaignForm?.get('campaignId')?.value || '');
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
      const previouslySent = new Set(this.skipPreviouslySent ? this.recipientLogs.filter(r =>
        ['PENDING', 'SENT', 'DELIVERED', 'READ', 'UNKNOWN'].includes(r.status) && r.channel === this.recipientChannel).map(r => Number(r.contactId)) : []);
      return this.contacts.filter(contact => {
        if (contact.status === 'INACTIVE' || previouslySent.has(Number(contact.id))) return false;
        if (this.recipientChannel === 'EMAIL') return !!contact?.emailId;
        if (this.recipientChannel === 'ALL') return !!(contact?.mobileNumber || contact?.whatsAppNumber || contact?.phoneNumber || contact?.emailId);
        return !!(contact?.mobileNumber || contact?.whatsAppNumber || contact?.phoneNumber);
      });
    }

    public get recipientChannel(): string {
      return String(this.sendCompaignForm?.get('campaignChannel')?.value || this.selectedChannelFilter || 'ALL').toUpperCase();
    }

    public recipientContactDetail(contact: any): string {
      return this.recipientChannel === 'EMAIL'
        ? contact?.emailId || 'No email address'
        : contact?.mobileNumber || contact?.whatsAppNumber || contact?.phoneNumber || 'No mobile number';
    }

    public get recipientContactLabel(): string {
      return this.recipientChannel === 'EMAIL' ? 'email addresses' : this.recipientChannel === 'ALL' ? 'contacts available' : 'contacts with mobile numbers';
    }

    public get filteredContacts(): any[] {
      const term = this.contactSearch.trim().toLowerCase();
      return !term ? this.eligibleContacts : this.eligibleContacts.filter(contact =>
        [contact.contactName, contact.mobileNumber, contact.emailId, contact.companyName]
          .some(value => String(value || '').toLowerCase().includes(term)),
      );
    }

    public get recipientCount(): number {
      return this.selectedRecipients.length;
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
      return this.filteredContacts.length > 0 && this.filteredContacts.every(contact => this.recipientMode === 'ALL' || this.selectedContactIds.has(contact.id));
    }

    public toggleAllEligibleContacts(checked: boolean): void {
      const ids = new Set(this.selectedRecipients.map(c => c.id));
      this.filteredContacts.forEach(c => checked ? ids.add(c.id) : ids.delete(c.id));
      this.recipientMode = 'SELECTED'; this.selectedContactIds = ids;
    }

    private getContacts(): void {
      const requestId = ++this.contactLoadId;
      if (!this.audienceId) { this.contacts = []; this.isContactsLoading = false; return; }
      this.isContactsLoading = true;
      this.audienceService.contacts(this.audienceId).subscribe({
        next: response => {
          if (requestId !== this.contactLoadId) return;
          if (![200, 204].includes(Number(response.responseCode))) { this.contacts = []; this.audienceError = response.responseMessage; this.isContactsLoading = false; return; }
          this.contacts = Array.isArray(response?.listPayload) ? response.listPayload : [];
          this.isContactsLoading = false;
        },
        error: () => { if (requestId !== this.contactLoadId) return; this.contacts = []; this.isContactsLoading = false; this.audienceError = 'Could not load audience contacts.'; },
      });
    }

    public get selectedCampaign(): any {
      const campaignId = this.sendCompaignForm?.get('campaignId')?.value;
      return this.campaignDetailsList.find((campaign: any) => String(campaign.id) === String(campaignId));
    }

    public get visibleCampaigns(): any[] {
      const configuredCampaigns = this.campaignDetailsList.filter((campaign: any) =>
        ['WHATSAPP', 'EMAIL'].includes(String(campaign.campaignChannel).toUpperCase()));
      if (this.selectedChannelFilter === 'ALL') return configuredCampaigns;
      return configuredCampaigns.filter((campaign: any) =>
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
  if (this.isSending || this.isContactsLoading || this.isHistoryLoading || this.historyError) return;
  if (!['WHATSAPP', 'EMAIL'].includes(this.recipientChannel)) {
    this.messageService.add({ severity: 'error', summary: 'Channel unavailable', detail: 'Select a WhatsApp or Email campaign.' });
    return;
  }
  if (this.sendCompaignForm.invalid || !this.audienceId || this.recipientCount === 0) {
    this.messageService.add({ severity: 'error', summary: 'Selection required', detail: 'Select an audience, contacts, channel and campaign.' }); return;
  }
  if (this.selectedChannelFilter === 'WHATSAPP' && (!this.selectedWhatsAppTemplate || this.recipientCount === 0)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Recipients or template required',
      detail: 'Select a WhatsApp template and at least one recipient before sending the campaign.',
    });
    return;
  }

  const selectedContactIds = this.selectedRecipients.map(contact => contact.id);
  const campaignRequest = {
    ...this.sendCompaignForm.value,
    campaignName: this.selectedCampaign?.campaignName || '',
    templateId: this.selectedWhatsAppTemplate?.templateId || null,
    campaignType: this.selectedWhatsAppTemplate?.category || this.selectedCampaign?.campaignType || 'MARKETING',
    audienceId: this.audienceId,
    skipPreviouslySent: this.skipPreviouslySent,
    recipientMode: 'SELECTED',
    contactIds: selectedContactIds,
    campaignTo: `${this.selectedAudience?.audienceName}: ${selectedContactIds.length} selected contacts`,
    whatsAppRequest: this.selectedWhatsAppTemplate ? {
      templateName: this.selectedWhatsAppTemplate.templateName,
      language: this.selectedWhatsAppTemplate.language || 'en',
      msgBodyVariable: (this.selectedWhatsAppTemplate.msgBodyVariable || []).map((variable: any) => ({
        bodyVariable: variable.bodyVariable || variable.value || '',
      })),
    } : null,
    description: this.selectedWhatsAppTemplate
      ? this.selectedWhatsAppTemplate.msgBodyText || this.selectedWhatsAppTemplate.message || this.selectedWhatsAppTemplate.body || ''
      : this.selectedCampaign?.campaignDescription || this.selectedCampaign?.description || '',
  };

  this.isSending = true;
  this.campaignSendService.sendCompaign(campaignRequest).subscribe({
    next: (response: any) => {
      this.isSending = false;
      if (response.responseCode === 200) {
        if (response.payload.respCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.payload.respMesg
          });

          this.selectedContactIds = new Set();
          this.recipientMode = 'SELECTED';
          this.loadRecipientLogs();
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
      this.isSending = false; this.loadRecipientLogs();
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
