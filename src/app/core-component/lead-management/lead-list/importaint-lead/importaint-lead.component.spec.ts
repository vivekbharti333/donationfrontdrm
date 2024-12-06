import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportaintLeadComponent } from './importaint-lead.component';

describe('ImportaintLeadComponent', () => {
  let component: ImportaintLeadComponent;
  let fixture: ComponentFixture<ImportaintLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportaintLeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportaintLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
