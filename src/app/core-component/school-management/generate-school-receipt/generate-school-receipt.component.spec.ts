import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSchoolReceiptComponent } from './generate-school-receipt.component';

describe('GenerateSchoolReceiptComponent', () => {
  let component: GenerateSchoolReceiptComponent;
  let fixture: ComponentFixture<GenerateSchoolReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateSchoolReceiptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerateSchoolReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
