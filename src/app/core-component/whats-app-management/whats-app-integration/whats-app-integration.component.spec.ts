import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WhatsAppIntegrationComponent } from './whats-app-integration.component';

describe('WhatsAppIntegrationComponent', () => {
  let component: WhatsAppIntegrationComponent;
  let fixture: ComponentFixture<WhatsAppIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WhatsAppIntegrationComponent],
      imports: [HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsAppIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
