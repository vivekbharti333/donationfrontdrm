import { FormBuilder } from '@angular/forms';
import { NEVER } from 'rxjs';
import { CampaignSendComponent } from './campaign-send.component';

describe('Campaign saved template headers', () => {
  let component: CampaignSendComponent;
  let api: any;
  beforeEach(() => {
    api = jasmine.createSpyObj('api', ['sendCompaign']);
    api.sendCompaign.and.returnValue(NEVER);
    component = new CampaignSendComponent(null as any, null as any, null as any, null as any,
      jasmine.createSpyObj('messages', ['add']), api, null as any, null as any, null as any, new FormBuilder());
    component.createForms();
    component.sendCompaignForm.patchValue({ campaignId: 1, campaignChannel: 'WHATSAPP' });
    component.selectedChannelFilter = 'WHATSAPP';
    component.audienceId = 2;
    component.audiences = [{ id: 2, audienceName: 'Customers' }];
    component.contacts = [{ id: 3, mobileNumber: '919999999999' }];
  });

  it('sends the template ID and lets the server resolve saved image and body values', () => {
    component.selectWhatsAppTemplate({ templateId: '123456789012345', templateName: 'offer', language: 'en',
      status: 'APPROVED', headerFormat: 'IMAGE', headerImageFileName: 'saved.jpg', msgBodyVariable: [{ bodyVariable: '1' }] });
    component.sendCompaign();
    const request = api.sendCompaign.calls.mostRecent().args[0];
    expect(request.templateId).toBe('123456789012345');
    expect(request.whatsAppRequest.headerFormat).toBe('IMAGE');
    expect(request.whatsAppRequest.headerImageUrl).toBeUndefined();
    expect(request.whatsAppRequest.msgBodyVariable).toBeUndefined();
  });

  it('requires a URL for an older image template and includes it when supplied', () => {
    component.selectWhatsAppTemplate({ templateId: '123', templateName: 'old_offer', headerFormat: 'IMAGE' });
    component.sendCompaign();
    expect(api.sendCompaign).not.toHaveBeenCalled();
    component.campaignHeaderImageUrl = 'https://example.com/banner.jpg';
    component.sendCompaign();
    expect(api.sendCompaign.calls.mostRecent().args[0].whatsAppRequest.headerImageUrl).toBe('https://example.com/banner.jpg');
  });

  it('clears the previous image URL when selecting another template', () => {
    component.campaignHeaderImageUrl = 'https://example.com/previous.jpg';
    component.selectWhatsAppTemplate({ templateId: '456', headerFormat: 'TEXT' });
    expect(component.campaignHeaderImageUrl).toBe('');
  });
});
