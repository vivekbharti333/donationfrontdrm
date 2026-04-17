import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppManagementComponent } from './whats-app-management.component';

describe('WhatsAppManagementComponent', () => {
  let component: WhatsAppManagementComponent;
  let fixture: ComponentFixture<WhatsAppManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsAppManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsAppManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
