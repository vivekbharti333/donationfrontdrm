import { TestBed } from '@angular/core/testing';

import { WhatsAppCredentialService } from './whats-app-credential.service';

describe('WhatsAppCredentialService', () => {
  let service: WhatsAppCredentialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhatsAppCredentialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
