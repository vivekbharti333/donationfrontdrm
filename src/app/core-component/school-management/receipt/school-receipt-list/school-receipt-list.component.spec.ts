import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolReceiptListComponent } from './school-receipt-list.component';

describe('SchoolReceiptListComponent', () => {
  let component: SchoolReceiptListComponent;
  let fixture: ComponentFixture<SchoolReceiptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolReceiptListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchoolReceiptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
