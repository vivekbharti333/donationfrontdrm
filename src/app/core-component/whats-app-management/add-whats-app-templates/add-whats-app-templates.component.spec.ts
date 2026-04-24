import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWhatsAppTemplatesComponent } from './add-whats-app-templates.component';

describe('AddWhatsAppTemplatesComponent', () => {
  let component: AddWhatsAppTemplatesComponent;
  let fixture: ComponentFixture<AddWhatsAppTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWhatsAppTemplatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddWhatsAppTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
