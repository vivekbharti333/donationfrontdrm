import { FormBuilder } from '@angular/forms';
import { NEVER, of } from 'rxjs';
import { AddWhatsAppTemplatesComponent } from './add-whats-app-templates.component';
import { AddWhatsAppTemplatesService } from './add-whats-app-templates.service';

describe('Template header requests', () => {
  it('keeps the header contact mapping after editing and submits it', () => {
    const api = jasmine.createSpyObj('api', ['createTemplate']);
    api.createTemplate.and.returnValue(NEVER);
    const component = new AddWhatsAppTemplatesComponent(new FormBuilder(), api, {} as any);
    component.createForms();
    component.addTemplateForm.patchValue({ templateName: 'offer', msgBodyText: 'Welcome to our event.', headerText: 'Hello {{1}}' });
    component.detectHeaderVariables();
    component.headerVariablesArray.at(0).patchValue({ value: 'Example Ltd', type: 'companyName' });
    component.detectHeaderVariables();
    component.submitTemplate();
    const header = api.createTemplate.calls.mostRecent().args[0].payload.headerVariable[0];
    expect(header.variableType).toBe('companyName');
    expect(header.example).toBe('Example Ltd');
    expect(header.value).toBeNull();
  });

  it('submits a fixed header value separately from a contact mapping', () => {
    const api = jasmine.createSpyObj('api', ['createTemplate']);
    api.createTemplate.and.returnValue(NEVER);
    const component = new AddWhatsAppTemplatesComponent(new FormBuilder(), api, {} as any);
    component.createForms();
    component.addTemplateForm.patchValue({ templateName: 'offer', msgBodyText: 'Welcome to our event.', headerText: 'Hello {{1}}' });
    component.detectHeaderVariables();
    component.headerVariablesArray.at(0).patchValue({ value: 'Everyone', type: 'FIXED' });
    component.submitTemplate();
    const header = api.createTemplate.calls.mostRecent().args[0].payload.headerVariable[0];
    expect(header.value).toBe('Everyone');
    expect(header.variableType).toBeNull();
  });

  it('passes the saved filename from image upload to addTemplates', () => {
    const http = jasmine.createSpyObj('http', ['post']);
    http.post.and.returnValues(of({ responseCode: 200, payload: { mediaHandle: 'handle', headerImageFileName: 'saved.jpg' } }), of({ responseCode: 200 }));
    const service = new AddWhatsAppTemplatesService(http, { get: () => 'token' } as any,
      { getLoginUser: () => ({ superadminId: '42' }) } as any);
    service.createTemplate({ payload: { headerFormat: 'IMAGE' } }, new File(['image'], 'header.jpg', { type: 'image/jpeg' }), 'Image').subscribe();
    expect(http.post.calls.count()).toBe(2);
    const request = http.post.calls.mostRecent().args;
    expect(request[0]).toContain('addTemplates');
    expect(request[1].payload.headerImageFileName).toBe('saved.jpg');
    expect(request[1].payload.headerImageUrl).toBeNull();
  });

  it('does not create an image template when the upload returns no saved image', () => {
    const http = jasmine.createSpyObj('http', ['post']);
    http.post.and.returnValue(of({ responseCode: 200, payload: { mediaHandle: 'handle' } }));
    const service = new AddWhatsAppTemplatesService(http, { get: () => 'token' } as any,
      { getLoginUser: () => ({ superadminId: '42' }) } as any);
    let error: any;
    service.createTemplate({ payload: {} }, new File(['image'], 'header.jpg'), 'Image').subscribe({ error: e => error = e });
    expect(error.message).toContain('not saved');
    expect(http.post.calls.count()).toBe(1);
  });
});
