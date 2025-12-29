import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceiptHeaderComponent } from './add-receipt-header.component';

describe('AddReceiptHeaderComponent', () => {
  let component: AddReceiptHeaderComponent;
  let fixture: ComponentFixture<AddReceiptHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReceiptHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddReceiptHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
