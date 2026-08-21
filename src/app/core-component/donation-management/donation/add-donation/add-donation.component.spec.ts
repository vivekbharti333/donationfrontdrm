import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDonationComponent } from './add-donation.component';

describe('AddDonationComponent', () => {
  let component: AddDonationComponent;
  let fixture: ComponentFixture<AddDonationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDonationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDonationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
