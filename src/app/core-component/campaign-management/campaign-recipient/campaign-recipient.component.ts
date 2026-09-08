import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CampaignSendService } from '../campaign-send/campaign-send.service';
import { CampaignRecipient, CampaignRecipientService } from './campaign-recipient.service';

@Component({
  selector: 'app-campaign-recipient',
  templateUrl: './campaign-recipient.component.html',
  styleUrl: './campaign-recipient.component.scss',
})
export class CampaignRecipientComponent implements OnInit, OnDestroy {
  campaigns: { id: number; campaignName: string }[] = [];
  campaignId: number | null = null;
  recipients: CampaignRecipient[] = [];
  search = '';
  status = '';
  page = 1;
  pageSize = 10;
  loading = false;
  campaignsLoading = false;
  error = '';
  campaignsError = '';
  private campaignsRequest?: Subscription;
  private recipientsRequest?: Subscription;

  constructor(private campaignsService: CampaignSendService, private service: CampaignRecipientService) {}
  ngOnInit(): void { this.loadCampaigns(); }
  loadCampaigns(): void {
    this.campaignsRequest?.unsubscribe();
    this.campaignsLoading = true;
    this.campaignsError = '';
    this.campaignsRequest = this.campaignsService.getCampaignDetails().subscribe({
      next: response => {
        this.campaignsLoading = false;
        if (![200, 204].includes(Number(response.responseCode))) {
          this.campaignsError = response.responseMessage || 'Could not load campaigns.';
          return;
        }
        this.campaigns = response.listPayload || [];
        this.campaignId = this.campaigns[0]?.id ?? null;
        this.getCampaignRecipients();
      },
      error: () => { this.campaignsLoading = false; this.campaignsError = 'Could not load campaigns. Please try again.'; },
    });
  }
  getCampaignRecipients(): void {
    this.recipientsRequest?.unsubscribe();
    this.recipients = [];
    this.page = 1;
    this.error = '';
    this.loading = false;
    if (!this.campaignId) return;
    this.loading = true;
    this.recipientsRequest = this.service.getCampaignRecipients(Number(this.campaignId)).subscribe({
      next: response => {
        this.loading = false;
        if (![200, 204].includes(Number(response.responseCode))) {
          this.error = response.responseMessage || 'Could not load recipients.';
          return;
        }
        this.recipients = response.listPayload || [];
      },
      error: () => { this.loading = false; this.error = 'Could not load recipients. Please try again.'; },
    });
  }
  get statuses(): string[] { return [...new Set(this.recipients.map(row => row.status).filter(Boolean))].sort(); }
  get filtered(): CampaignRecipient[] {
    const term = this.search.trim().toLowerCase();
    return this.recipients.filter(row => (!this.status || row.status === this.status) &&
      [row.contactId, row.audienceName, row.channel, row.status, row.errorMessage, row.whatsAppMessageId]
        .some(value => String(value ?? '').toLowerCase().includes(term)));
  }
  get pages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get rows(): CampaignRecipient[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get first(): number { return this.filtered.length ? (this.page - 1) * this.pageSize + 1 : 0; }
  get last(): number { return Math.min(this.page * this.pageSize, this.filtered.length); }
  resetPage(): void { this.page = 1; }
  statusClass(status: string): string {
    if (['SENT', 'DELIVERED', 'READ'].includes(status)) return 'success';
    if (status === 'FAILED') return 'danger';
    return ['PENDING', 'UNKNOWN'].includes(status) ? 'warning' : 'neutral';
  }
  ngOnDestroy(): void { this.campaignsRequest?.unsubscribe(); this.recipientsRequest?.unsubscribe(); }
}
