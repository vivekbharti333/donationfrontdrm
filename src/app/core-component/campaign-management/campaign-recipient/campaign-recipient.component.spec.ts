import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignRecipientComponent } from './campaign-recipient.component';

describe('CampaignRecipientComponent', () => {
  let component: CampaignRecipientComponent;
  let fixture: ComponentFixture<CampaignRecipientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignRecipientComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CampaignRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
