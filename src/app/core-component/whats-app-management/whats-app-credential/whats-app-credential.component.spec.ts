import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppCredentialComponent } from './whats-app-credential.component';

describe('WhatsAppCredentialComponent', () => {
  let component: WhatsAppCredentialComponent;
  let fixture: ComponentFixture<WhatsAppCredentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsAppCredentialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsAppCredentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
