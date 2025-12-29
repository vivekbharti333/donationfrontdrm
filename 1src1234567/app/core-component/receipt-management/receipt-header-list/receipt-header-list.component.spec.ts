import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptHeaderListComponent } from './receipt-header-list.component';

describe('ReceiptHeaderListComponent', () => {
  let component: ReceiptHeaderListComponent;
  let fixture: ComponentFixture<ReceiptHeaderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptHeaderListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceiptHeaderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
