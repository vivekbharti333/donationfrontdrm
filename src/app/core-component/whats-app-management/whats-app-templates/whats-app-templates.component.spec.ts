import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppTemplatesComponent } from './whats-app-templates.component';

describe('WhatsAppTemplatesComponent', () => {
  let component: WhatsAppTemplatesComponent;
  let fixture: ComponentFixture<WhatsAppTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsAppTemplatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsAppTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
