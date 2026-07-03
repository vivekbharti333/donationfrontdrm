import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignSendComponent } from './campaign-send.component';

describe('CampaignSendComponent', () => {
  let component: CampaignSendComponent;
  let fixture: ComponentFixture<CampaignSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignSendComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CampaignSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
