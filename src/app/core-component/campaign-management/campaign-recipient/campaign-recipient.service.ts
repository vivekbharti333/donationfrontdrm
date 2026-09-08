import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import { AudienceService } from '../campaign-send/audience.service';
import { Constant } from 'src/app/core/constant/constants';

export interface CampaignRecipient {
  id: number;
  contactId: number;
  audienceId: number | null;
  audienceName?: string;
  channel: string;
  status: string;
  createdAt: string | null;
  sentAt: string | null;
  errorMessage: string | null;
  whatsAppMessageId: number | null;
}
@Injectable({ providedIn: 'root' })
export class CampaignRecipientService {
  constructor(private http: HttpClient, private audienceService: AudienceService) {}
  getCampaignRecipients(campaignId: number) {
    return forkJoin({
      recipients: this.http.post<{ responseCode: number; responseMessage: string; listPayload?: CampaignRecipient[] }>(
        Constant.Site_Url + 'getCampaignRecipients', { payload: { campaignId } }),
      audiences: this.audienceService.list(),
    }).pipe(map(({ recipients, audiences }) => {
      if (![200, 204].includes(Number(audiences.responseCode))) {
        throw new Error('Could not load audience names. Please try again.');
      }
      const names = new Map<number, string>((audiences.listPayload || []).map(
        (audience: { id: number; audienceName: string }) => [Number(audience.id), audience.audienceName]));
      return {
        ...recipients,
        listPayload: (recipients.listPayload || []).map(row => ({
          ...row,
          audienceName: row.audienceId == null ? 'No audience' : names.get(Number(row.audienceId)) || 'Audience unavailable',
        })),
      };
    }));
  }
}
