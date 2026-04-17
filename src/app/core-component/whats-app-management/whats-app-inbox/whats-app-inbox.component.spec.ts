import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppInboxComponent } from './whats-app-inbox.component';

describe('WhatsAppInboxComponent', () => {
  let component: WhatsAppInboxComponent;
  let fixture: ComponentFixture<WhatsAppInboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsAppInboxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsAppInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
